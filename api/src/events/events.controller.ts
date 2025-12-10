import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { EventsService } from './events.service';
import { Prisma } from '@prisma/client';

@Controller('events')
export class EventsController {
    constructor(private readonly eventsService: EventsService) { }

    @Post()
    create(@Body() data: Prisma.EventCreateInput) {
        return this.eventsService.create(data);
    }

    @Get()
    findAll() {
        return this.eventsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.eventsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() data: Prisma.EventUpdateInput) {
        return this.eventsService.update(id, data);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.eventsService.remove(id);
    }
}
