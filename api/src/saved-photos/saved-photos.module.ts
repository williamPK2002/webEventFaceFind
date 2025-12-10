import { Module } from '@nestjs/common';
import { SavedPhotosController } from './saved-photos.controller';
import { SavedPhotosService } from './saved-photos.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [SavedPhotosController],
    providers: [SavedPhotosService],
})
export class SavedPhotosModule { }
