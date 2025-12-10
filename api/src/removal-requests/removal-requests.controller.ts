import { Controller, Post, Body, Get, Delete, Param, Headers, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('removal-requests')
export class RemovalRequestsController {
    constructor(private prisma: PrismaService) { }

    @Post()
    async create(
        @Body() data: { photoId: string; requestType: string; userName: string; userEmail?: string; reason?: string },
    ) {
        if (!data.userName) {
            throw new UnauthorizedException('User name required');
        }

        // Find or create user
        let user = await this.prisma.user.findUnique({
            where: { email: data.userEmail || `${data.userName.toLowerCase().replace(/\s+/g, '')}@temp.local` },
        });

        if (!user) {
            user = await this.prisma.user.create({
                data: {
                    email: data.userEmail || `${data.userName.toLowerCase().replace(/\s+/g, '')}@temp.local`,
                    name: data.userName,
                    role: 'STUDENT',
                },
            });
        }

        const request = await this.prisma.removalRequest.create({
            data: {
                photoId: data.photoId,
                userId: user.id,
                requestType: data.requestType.toUpperCase() as any,
                reason: data.reason,
            },
        });

        console.log('Removal request created:', request);

        return {
            message: 'Removal request submitted successfully',
            requestId: request.id,
        };
    }

    @Get()
    async findAll() {
        const requests = await this.prisma.removalRequest.findMany({
            include: {
                photo: {
                    include: { event: true },
                },
                user: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return requests.map(req => ({
            id: req.id,
            photoId: req.photoId,
            requestType: req.requestType,
            userName: req.user?.name || 'Unknown',
            reason: req.reason,
            createdAt: req.createdAt,
            status: req.status,
            photo: req.photo ? {
                id: req.photo.id,
                url: req.photo.storageUrl,
                eventName: req.photo.event.name,
            } : null,
        }));
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        try {
            await this.prisma.removalRequest.delete({
                where: { id },
            });
            return { message: 'Request deleted successfully' };
        } catch (error) {
            return { message: 'Request not found' };
        }
    }
}
