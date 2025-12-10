import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as Minio from 'minio';

@Injectable()
export class MinioService implements OnModuleInit {
    private readonly logger = new Logger(MinioService.name);
    private minioClient: Minio.Client;
    private readonly bucketName = process.env.MINIO_BUCKET || 'photos';

    async onModuleInit() {
        const endpoint = process.env.MINIO_ENDPOINT || 'localhost';
        const port = parseInt(process.env.MINIO_PORT || '9000');
        const useSSL = process.env.MINIO_USE_SSL === 'true';
        const accessKey = process.env.MINIO_ACCESS_KEY || 'minioadmin';
        const secretKey = process.env.MINIO_SECRET_KEY || 'minioadmin';

        this.logger.log(`Connecting to MinIO at ${endpoint}:${port} (useSSL=${useSSL})`);

        this.minioClient = new Minio.Client({
            endPoint: endpoint,
            port: port,
            useSSL: useSSL,
            accessKey: accessKey,
            secretKey: secretKey,
        });

        // Ensure bucket exists
        const exists = await this.minioClient.bucketExists(this.bucketName);
        if (!exists) {
            await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
            this.logger.log(`Created bucket: ${this.bucketName}`);
        }

        // Set bucket policy to allow public read access
        const policy = {
            Version: '2012-10-17',
            Statement: [
                {
                    Effect: 'Allow',
                    Principal: { AWS: ['*'] },
                    Action: ['s3:GetObject'],
                    Resource: [`arn:aws:s3:::${this.bucketName}/*`],
                },
            ],
        };

        try {
            await this.minioClient.setBucketPolicy(
                this.bucketName,
                JSON.stringify(policy),
            );
            this.logger.log(`Set public read policy for bucket: ${this.bucketName}`);
        } catch (error) {
            this.logger.warn(`Failed to set bucket policy: ${error.message}`);
        }
    }

    async uploadFile(
        fileName: string,
        fileBuffer: Buffer,
        contentType: string,
    ): Promise<string> {
        const objectName = `${Date.now()}-${fileName}`;

        await this.minioClient.putObject(
            this.bucketName,
            objectName,
            fileBuffer,
            fileBuffer.length,
            {
                'Content-Type': contentType,
            },
        );

        // Return the URL
        return `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${this.bucketName}/${objectName}`;
    }

    async getFileUrl(objectName: string): Promise<string> {
        return await this.minioClient.presignedGetObject(this.bucketName, objectName, 24 * 60 * 60);
    }

    async getFile(objectName: string) {
        this.logger.log(`Getting file: ${objectName}`);
        return await this.minioClient.getObject(this.bucketName, objectName);
    }

    async deleteFile(objectName: string): Promise<void> {
        await this.minioClient.removeObject(this.bucketName, objectName);
        this.logger.log(`Deleted file: ${objectName}`);
    }
}
