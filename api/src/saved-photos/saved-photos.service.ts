import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SavedPhotosService {
    constructor(private prisma: PrismaService) { }

    async getSavedPhotos(userId: string) {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email: `${userId}@temp.local` },
        });

        if (!user) {
            return []; // No user, no saved photos
        }

        // OPTIMIZED: Single query with nested includes
        const savedPhotos = await this.prisma.savedPhoto.findMany({
            where: { userId: user.id },
            include: {
                photo: {
                    include: {
                        event: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return savedPhotos.map(sp => ({
            id: sp.photo.id,
            url: sp.photo.storageUrl,
            eventName: sp.photo.event.name,
            eventDate: sp.photo.event.date,
            savedAt: sp.createdAt,
            photo: sp.photo,
        }));
    }

    async savePhoto(userId: string, photoId: string) {
        // Find or create user
        let user = await this.prisma.user.findUnique({
            where: { email: `${userId}@temp.local` },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: `${userId}@temp.local`,
                    name: userId,
                    role: 'STUDENT',
                },
            });
        }

        // Check if already saved
        const existing = await this.prisma.savedPhoto.findUnique({
            where: {
                userId_photoId: {
                    userId: user.id,
                    photoId,
                },
            },
        });

        if (existing) {
            return { message: 'Photo already saved', saved: true };
        }

        await this.prisma.savedPhoto.create({
            data: {
                userId: user.id,
                photoId,
            },
        });

        return { message: 'Photo saved successfully', saved: true };
    }

    async unsavePhoto(userId: string, photoId: string) {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email: `${userId}@temp.local` },
        });

        if (!user) {
            return { message: 'User not found', saved: false };
        }

        await this.prisma.savedPhoto.deleteMany({
            where: {
                userId: user.id,
                photoId,
            },
        });

        return { message: 'Photo removed from saved', saved: false };
    }
}
