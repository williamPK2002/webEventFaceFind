import { Injectable, OnModuleInit } from '@nestjs/common';
import weaviate, { WeaviateClient, ApiKey } from 'weaviate-ts-client';

@Injectable()
export class SearchService implements OnModuleInit {
    private client: WeaviateClient;

    async onModuleInit() {
        this.client = weaviate.client({
            scheme: process.env.WEAVIATE_SCHEME || 'http',
            host: process.env.WEAVIATE_HOST || 'localhost:8080',
        });

        // Ensure schema exists
        await this.ensureSchema();
    }

    async ensureSchema() {
        const schemaConfig = {
            class: 'Face',
            vectorizer: 'none', // We provide vectors manually
            properties: [
                {
                    name: 'photoId',
                    dataType: ['string'],
                },
                {
                    name: 'eventId',
                    dataType: ['string'],
                },
            ],
        };

        try {
            const schema = await this.client.schema.getter().do();
            const classExists = schema.classes?.some((c) => c.class === 'Face');

            if (!classExists) {
                await this.client.schema.classCreator().withClass(schemaConfig).do();
                console.log('Weaviate "Face" class created.');
            }
        } catch (error) {
            console.error('Error checking/creating Weaviate schema:', error);
        }
    }

    async addFace(vector: number[], photoId: string, eventId: string): Promise<string> {
        const result = await this.client.data
            .creator()
            .withClassName('Face')
            .withProperties({
                photoId,
                eventId,
            })
            .withVector(vector)
            .do();

        if (!result.id) {
            throw new Error('Failed to create face in Weaviate');
        }

        return result.id;
    }

    async searchFaces(vector: number[], limit = 10) {
        return await this.client.graphql
            .get()
            .withClassName('Face')
            .withFields('photoId eventId _additional { distance }')
            .withNearVector({ vector })
            .withLimit(limit)
            .do();
    }

    async deleteFace(weaviateId: string) {
        await this.client.data
            .deleter()
            .withClassName('Face')
            .withId(weaviateId)
            .do();
    }
}
