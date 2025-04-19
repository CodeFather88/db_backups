import { Client } from 'minio'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

@Injectable()
export class MinioService implements OnModuleInit {
  constructor(@Inject('MINIO') readonly minio: Client) {}

  async onModuleInit() {
    const backups = await this.minio.bucketExists('backups')
    if (!backups) {
      await this.minio.makeBucket('backups')
    }
  }
}
