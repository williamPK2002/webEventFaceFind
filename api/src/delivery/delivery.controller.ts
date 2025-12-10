import { Controller, Post, Body } from '@nestjs/common';
import { DeliveryService } from './delivery.service';

@Controller('delivery')
export class DeliveryController {
    constructor(private readonly deliveryService: DeliveryService) { }

    @Post('trigger')
    triggerDelivery(@Body() body: { userId: string; eventId: string }) {
        return this.deliveryService.sendDelivery(body.userId, body.eventId);
    }
}
