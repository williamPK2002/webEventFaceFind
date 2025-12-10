import { Controller, Get } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Controller('admin')
export class AdminController {
    constructor(private prisma: PrismaService) { }

    @Get('stats')
    async getStats() {
        const [
            totalUsers,
            totalEvents,
            totalPhotos,
            facesDetected,
            activeEvents,
            eventsByStatus,
            photosByStatus,
            usersByRole
        ] = await Promise.all([
            this.prisma.user.count(),
            this.prisma.event.count(),
            this.prisma.photo.count(),
            this.prisma.face.count(),
            this.prisma.event.count({ where: { status: 'PUBLISHED' } }),
            // Events breakdown
            this.prisma.event.groupBy({
                by: ['status'],
                _count: true
            }),
            // Photos breakdown
            this.prisma.photo.groupBy({
                by: ['processingStatus'],
                _count: true
            }),
            // Users breakdown
            this.prisma.user.groupBy({
                by: ['role'],
                _count: true
            })
        ]);

        return {
            totalUsers,
            totalEvents,
            totalPhotos,
            facesDetected,
            activeEvents,
            eventsByStatus: eventsByStatus.map(e => ({ status: e.status, count: e._count })),
            photosByStatus: photosByStatus.map(p => ({ status: p.processingStatus, count: p._count })),
            usersByRole: usersByRole.map(u => ({ role: u.role, count: u._count }))
        };
    }
}
