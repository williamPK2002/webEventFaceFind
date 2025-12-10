import { Module } from '@nestjs/common';
import { RemovalRequestsController } from './removal-requests.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [RemovalRequestsController],
})
export class RemovalRequestsModule { }
