import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DeliveryService {
    constructor(private prisma: PrismaService) { }

    async sendDelivery(userId: string, eventId: string) {
        // 1. Create a delivery record
        const delivery = await this.prisma.delivery.create({
            data: {
                userId,
                eventId,
                status: 'PENDING',
            },
        });

        // 2. Mock sending email/Line message
        console.log(`Sending photos for Event ${eventId} to User ${userId}...`);

        // Simulate async sending
        setTimeout(async () => {
            console.log(`Sent! Updating status for Delivery ${delivery.id}`);
            await this.prisma.delivery.update({
                where: { id: delivery.id },
                data: { status: 'SENT', sentAt: new Date() },
            });
        }, 1000);

        return delivery;
    }
}
