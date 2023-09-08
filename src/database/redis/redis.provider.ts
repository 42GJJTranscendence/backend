import { createClient } from 'redis';

export const redisProvider = [
    {
        provide: 'REDIS_CLIENT',
        useFactory: async () => {
            const client = createClient({
                url: process.env.REDIS_URL
            });
            await client.connect();
            return client;
        }
    }
]