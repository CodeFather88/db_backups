import * as Minio from 'minio'
import { Global, Module } from '@nestjs/common'
import { MinioService } from './minio.service'
import { ConfigService } from '../config/config.service'
import { ConfigModule } from '../config/config.module'

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'MINIO',
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        return new Minio.Client({
          port: config.MINIO_API,
          accessKey: config.MINIO_USER,
          secretKey: config.MINIO_PASSWORD,
          useSSL: false,
          endPoint: config.MINIO_HOST,
        })
      },
    },
    MinioService,
  ],
  exports: [MinioService],
})
export class MinioModule {}
