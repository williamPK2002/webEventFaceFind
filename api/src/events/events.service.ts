import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { PhotosService } from '../photos/photos.service';

@Injectable()
export class EventsService {
    constructor(
        private prisma: PrismaService,
        private photosService: PhotosService,
    ) { }

    create(data: Prisma.EventCreateInput) {
        return this.prisma.event.create({ data });
    }

    findAll() {
        return this.prisma.event.findMany();
    }

    findOne(id: string) {
        return this.prisma.event.findUnique({ where: { id } });
    }

    update(id: string, data: Prisma.EventUpdateInput) {
        return this.prisma.event.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        // 1. Find all photos for this event
        const photos = await this.prisma.photo.findMany({
            where: { eventId: id },
            include: { faces: true },
        });

        if (photos.length === 0) {
            // No photos, just delete the event
            return this.prisma.event.delete({ where: { id } });
        }

        // 2. Delete all related data in a transaction (OPTIMIZED: batch + parallel)
        return await this.prisma.$transaction(async (tx) => {
            const photoIds = photos.map(p => p.id);
            const faceIds = photos.flatMap(p => p.faces.map(f => f.weaviateId)).filter(Boolean);

            // Delete related records in parallel
            await Promise.all([
                tx.face.deleteMany({ where: { photoId: { in: photoIds } } }),
                tx.savedPhoto.deleteMany({ where: { photoId: { in: photoIds } } }),
                tx.removalRequest.deleteMany({ where: { photoId: { in: photoIds } } }),
                tx.abuseReport.deleteMany({ where: { photoId: { in: photoIds } } }),
            ]);

            // Delete from Weaviate (parallel, outside transaction)
            await Promise.all(
                faceIds.map(weaviateId => 
                    this.photosService['searchService'].deleteFace(weaviateId as string)
                        .catch(err => console.warn(`Failed to delete face ${weaviateId}:`, err))
                )
            );

            // Delete from MinIO (parallel, outside transaction)
            await Promise.all(
                photos.map(photo => {
                    const objectName = photo.storageUrl.split('/').pop();
                    return objectName 
                        ? this.photosService['minioService'].deleteFile(objectName)
                            .catch(err => console.warn(`Failed to delete MinIO object:`, err))
                        : Promise.resolve();
                })
            );

            // Delete photos
            await tx.photo.deleteMany({ where: { id: { in: photoIds } } });

            // Delete the event
            return tx.event.delete({ where: { id } });
        });
    }
}
