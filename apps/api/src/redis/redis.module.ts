import { Global, Module, OnModuleDestroy } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.constants';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      inject: [ConfigService],
      useFactory: (configService: ConfigService): Redis => {
        const url = configService.get<string>('REDIS_URL');
        if (!url) throw new Error('REDIS_URL environment variable is required');
        return new Redis(url);
      },
    },
    {
      provide: 'REDIS_MODULE_DESTROY',
      inject: [REDIS_CLIENT],
      useFactory: (redis: Redis): OnModuleDestroy => {
        return {
          async onModuleDestroy(): Promise<void> {
            await redis.quit();
          },
        };
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
