import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
    constructor(private readonly metricsService: MetricsService) {}

    use(req: Request, res: Response, next: NextFunction) {
        const start = Date.now();

        // Capture response finish event
        res.on('finish', () => {
            const duration = (Date.now() - start) / 1000;
            const route = req.route?.path || req.path;
            const method = req.method;
            const statusCode = res.statusCode.toString();

            // Increment request counter
            this.metricsService.httpRequestsTotal.inc({
                method,
                route,
                status_code: statusCode,
            });

            // Record request duration
            this.metricsService.httpRequestDuration.observe(
                {
                    method,
                    route,
                    status_code: statusCode,
                },
                duration,
            );
        });

        next();
    }
}
