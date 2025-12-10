import { Module, Global, MiddlewareConsumer, NestModule } from '@nestjs/common';
import { MetricsService } from './metrics.service';
import { MetricsController } from './metrics.controller';
import { MetricsMiddleware } from './metrics.middleware';

@Global()
@Module({
    providers: [MetricsService],
    controllers: [MetricsController],
    exports: [MetricsService],
})
export class MetricsModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(MetricsMiddleware).forRoutes('*');
    }
}
