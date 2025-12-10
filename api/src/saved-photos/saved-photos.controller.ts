import { Controller, Get, Post, Delete, Param, Body, Headers, UnauthorizedException } from '@nestjs/common';
import { SavedPhotosService } from './saved-photos.service';

@Controller('saved-photos')
export class SavedPhotosController {
    constructor(private readonly savedPhotosService: SavedPhotosService) { }

    @Get(':userId')
    async getSavedPhotos(@Param('userId') userId: string) {
        if (!userId) {
            throw new UnauthorizedException('User ID required');
        }
        return this.savedPhotosService.getSavedPhotos(userId);
    }

    @Post()
    async savePhoto(
        @Body() body: { photoId: string },
        @Headers('user-id') userId: string,
    ) {
        if (!userId) {
            throw new UnauthorizedException('User ID required');
        }
        return this.savedPhotosService.savePhoto(userId, body.photoId);
    }

    @Delete(':userId/:photoId')
    async unsavePhoto(
        @Param('userId') userId: string,
        @Param('photoId') photoId: string,
    ) {
        if (!userId) {
            throw new UnauthorizedException('User ID required');
        }
        return this.savedPhotosService.unsavePhoto(userId, photoId);
    }
}
