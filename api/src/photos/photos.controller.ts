import { Controller, Get, Post, Body, UseInterceptors, UploadedFile, BadRequestException, Delete, Param, Res } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { PhotosService } from './photos.service';
import { MetricsService } from '../metrics/metrics.service';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

@Controller('photos')
export class PhotosController {
    constructor(
        private readonly photosService: PhotosService,
        private readonly metricsService: MetricsService,
    ) { }

    @Get('view/:id')
    async viewPhoto(@Param('id') id: string, @Res() res: Response) {
        try {
            const stream = await this.photosService.downloadPhoto(id);
            res.set({
                'Content-Type': 'image/jpeg',
                'Cache-Control': 'public, max-age=3600',
            });
            stream.pipe(res);
        } catch (error) {
            res.status(404).json({ error: 'Photo not found' });
        }
    }

    @Get('download/:id')
    async downloadPhoto(@Param('id') id: string, @Res() res: Response) {
        try {
            const stream = await this.photosService.downloadPhoto(id);
            res.set({
                'Content-Type': 'image/jpeg',
                'Content-Disposition': `attachment; filename="photo-${id}.jpg"`,
            });
            stream.pipe(res);
        } catch (error) {
            res.status(404).json({ error: 'Photo not found' });
        }
    }

    @Post()
    create(@Body() data: Prisma.PhotoCreateInput) {
        return this.photosService.create(data);
    }

    @Get()
    findAll() {
        return this.photosService.findAll();
    }

    @Post('upload')
    @UseInterceptors(FileInterceptor('file'))
    async uploadPhoto(
        @UploadedFile() file: Express.Multer.File,
        @Body('eventId') eventId: string,
    ) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        if (!eventId) {
            throw new BadRequestException('Event ID is required');
        }

        try {
            const result = await this.photosService.uploadAndProcessPhoto(file, eventId);
            // Increment success counter
            this.metricsService.photoUploadsTotal.inc({ event_id: eventId, status: 'success' });
            return result;
        } catch (error) {
            // Increment failure counter
            this.metricsService.photoUploadsTotal.inc({ event_id: eventId, status: 'failed' });
            throw error;
        }
    }

    @Delete(':id')
    async deletePhoto(@Param('id') id: string) {
        return this.photosService.deletePhoto(id);
    }
}
