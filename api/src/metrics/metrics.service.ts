import { Injectable } from '@nestjs/common';
import { register, collectDefaultMetrics, Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsService {
    public readonly register = register;

    // Custom metrics
    public readonly httpRequestsTotal: Counter<string>;
    public readonly httpRequestDuration: Histogram<string>;
    public readonly photoUploadsTotal: Counter<string>;
    public readonly faceSearchTotal: Counter<string>;
    public readonly aiProcessingDuration: Histogram<string>;
    public readonly aiConfidenceScore: Histogram<string>;

    constructor() {
        // Collect default metrics (CPU, memory, etc.)
        collectDefaultMetrics({ register });

        // HTTP request counter
        this.httpRequestsTotal = new Counter({
            name: 'http_requests_total',
            help: 'Total number of HTTP requests',
            labelNames: ['method', 'route', 'status_code'],
            registers: [register],
        });

        // HTTP request duration
        this.httpRequestDuration = new Histogram({
            name: 'http_request_duration_seconds',
            help: 'Duration of HTTP requests in seconds',
            labelNames: ['method', 'route', 'status_code'],
            registers: [register],
        });

        // Photo uploads counter
        this.photoUploadsTotal = new Counter({
            name: 'photo_uploads_total',
            help: 'Total number of photo uploads',
            labelNames: ['event_id', 'status'],
            registers: [register],
        });

        // Face search counter
        this.faceSearchTotal = new Counter({
            name: 'face_search_total',
            help: 'Total number of face searches',
            labelNames: ['status'],
            registers: [register],
        });

        // AI processing duration
        this.aiProcessingDuration = new Histogram({
            name: 'ai_processing_duration_seconds',
            help: 'Duration of AI processing in seconds',
            labelNames: ['operation'],
            registers: [register],
        });

        // AI confidence score
        this.aiConfidenceScore = new Histogram({
            name: 'ai_confidence_score',
            help: 'Confidence score of AI detections and matches',
            labelNames: ['operation'], // 'detection' or 'match'
            buckets: [0.5, 0.6, 0.7, 0.8, 0.9, 0.95, 0.99, 1.0],
            registers: [register],
        });
    }

    getMetrics(): Promise<string> {
        return this.register.metrics();
    }

    async getMetricsJson(): Promise<any> {
        return this.register.getMetricsAsJSON();
    }
}
