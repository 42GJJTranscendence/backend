import { createClient } from 'redis';


// localhost

// export const redisProvider = [
//     {
//         provide: 'REDIS_CLIENT',
//         useFactory: async () => {
//             const client = createClient({
//                 url: 'redis://localhost:6379'
//             });
//             await client.connect();
//             return client;
//         }
//     }
// ]

//docker compose

export const redisProvider = [
    {
        provide: 'REDIS_CLIENT',
        useFactory: async () => {
            const client = createClient({
                url: 'redis://redis:6379'
            });
            await client.connect();
            return client;
        }
    }
]