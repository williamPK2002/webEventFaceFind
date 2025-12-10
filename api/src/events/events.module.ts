import { Module } from '@nestjs/common';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { PhotosModule } from '../photos/photos.module';

@Module({
  imports: [PhotosModule],
  controllers: [EventsController],
  providers: [EventsService]
})
export class EventsModule { }
