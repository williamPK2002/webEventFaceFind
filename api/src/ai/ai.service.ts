import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import FormData from 'form-data';

export interface FaceEmbedding {
    embedding: number[];
    bbox: number[];
    det_score: number;
}

@Injectable()
export class AiService {
    private readonly logger = new Logger(AiService.name);
    private readonly aiServiceUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';

    constructor(private readonly httpService: HttpService) { }

    async extractFaces(imageBuffer: Buffer): Promise<FaceEmbedding[]> {
        try {
            const formData = new FormData();
            formData.append('file', imageBuffer, { filename: 'image.jpg' });

            const { data } = await firstValueFrom(
                this.httpService.post<FaceEmbedding[]>(`${this.aiServiceUrl}/extract`, formData, {
                    headers: {
                        ...formData.getHeaders(),
                    },
                }),
            );

            return data;
        } catch (error) {
            this.logger.error('Error calling AI service:', error.message);
            throw error;
        }
    }
}
