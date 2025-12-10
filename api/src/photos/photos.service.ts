import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MinioService } from '../minio/minio.service';
import { AiService } from '../ai/ai.service';
import { SearchService } from '../search/search.service';
import { Prisma } from '@prisma/client';
import sharp from 'sharp';

import { MetricsService } from '../metrics/metrics.service';

@Injectable()
export class PhotosService {
    private readonly logger = new Logger(PhotosService.name);

    constructor(
        private prisma: PrismaService,
        private minioService: MinioService,
        private aiService: AiService,
        private searchService: SearchService,
        private metricsService: MetricsService,
    ) { }

    create(data: Prisma.PhotoCreateInput) {
        return this.prisma.photo.create({ data });
    }

    findAll() {
        return this.prisma.photo.findMany({
            include: { event: true },
        });
    }

    async uploadAndProcessPhoto(file: Express.Multer.File, eventId: string) {
        this.logger.log(`Processing photo upload for event ${eventId}`);

        // 1. Upload to MinIO
        const storageUrl = await this.minioService.uploadFile(
            file.originalname,
            file.buffer,
            file.mimetype,
        );

        // 2. Extract image dimensions
        let width: number | null = null;
        let height: number | null = null;
        try {
            const metadata = await sharp(file.buffer).metadata();
            width = metadata.width || null;
            height = metadata.height || null;
        } catch (error) {
            this.logger.warn('Failed to extract image dimensions:', error);
        }

        // 3. Create Photo record
        const photo = await this.prisma.photo.create({
            data: {
                eventId,
                storageUrl,
                mimeType: file.mimetype,
                processingStatus: 'PROCESSING',
                width,
                height,
            },
        });

        try {
            // 4. Detect faces with AI
            const start = Date.now();
            const faces = await this.aiService.extractFaces(file.buffer);
            const duration = (Date.now() - start) / 1000; // Convert to seconds
            this.metricsService.aiProcessingDuration.observe({ operation: 'extract_faces' }, duration);

            this.logger.log(`Detected ${faces.length} faces in photo ${photo.id}`);

            // Record confidence scores
            faces.forEach(face => {
                if (face.det_score) {
                    this.metricsService.aiConfidenceScore.observe({ operation: 'detection' }, face.det_score);
                }
            });

            // 5. Save faces to Weaviate and DB (OPTIMIZED: batch insert)
            const faceRecords: Prisma.FaceCreateManyInput[] = [];
            for (const faceData of faces) {
                // Save to Weaviate first to get ID
                const weaviateId = await this.searchService.addFace(
                    faceData.embedding,
                    photo.id,
                    eventId,
                );

                faceRecords.push({
                    photoId: photo.id,
                    weaviateId,
                    confidence: faceData.det_score,
                    x: faceData.bbox[0],
                    y: faceData.bbox[1],
                    w: faceData.bbox[2] - faceData.bbox[0],
                    h: faceData.bbox[3] - faceData.bbox[1],
                });
            }

            // Batch insert all faces at once
            if (faceRecords.length > 0) {
                await this.prisma.face.createMany({
                    data: faceRecords,
                });
            }

            // 6. Update photo status
            await this.prisma.photo.update({
                where: { id: photo.id },
                data: { processingStatus: 'COMPLETED' },
            });

            return {
                photoId: photo.id,
                storageUrl,
                facesDetected: faces.length,
                status: 'success',
            };
        } catch (error) {
            this.logger.error(`Error processing photo ${photo.id}:`, error);

            // Mark as failed
            await this.prisma.photo.update({
                where: { id: photo.id },
                data: { processingStatus: 'FAILED' },
            });

            throw error;
        }
    }

    async deletePhoto(id: string) {
        this.logger.log(`Deleting photo ${id}`);

        // 1. Get photo details
        const photo = await this.prisma.photo.findUnique({
            where: { id },
            include: { faces: true },
        });

        if (!photo) {
            throw new Error('Photo not found');
        }

        // 2. Delete faces from Weaviate
        for (const face of photo.faces) {
            if (face.weaviateId) {
                try {
                    await this.searchService.deleteFace(face.weaviateId);
                } catch (error) {
                    this.logger.warn(`Failed to delete face ${face.weaviateId} from Weaviate:`, error);
                }
            }
        }

        // 3. Delete faces from database first (foreign key constraint)
        await this.prisma.face.deleteMany({
            where: { photoId: id },
        });

        // 4. Delete photo from database
        await this.prisma.photo.delete({
            where: { id },
        });

        // 5. Delete from MinIO
        try {
            const objectName = photo.storageUrl.split('/').pop();
            if (objectName) {
                await this.minioService.deleteFile(objectName);
            }
        } catch (error) {
            this.logger.warn(`Failed to delete file from MinIO:`, error);
        }

        return { message: 'Photo deleted successfully', id };
    }

    async downloadPhoto(id: string) {
        this.logger.log(`Downloading photo ${id}`);

        // Get photo details
        const photo = await this.prisma.photo.findUnique({
            where: { id },
        });

        if (!photo) {
            throw new Error('Photo not found');
        }

        // Extract object name from URL
        const objectName = photo.storageUrl.split('/').pop();
        if (!objectName) {
            throw new Error('Invalid photo URL');
        }

        // Download from MinIO
        return await this.minioService.getFile(objectName);
    }
}

