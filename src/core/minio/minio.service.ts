import { Client } from 'minio'
import { Inject, Injectable, OnModuleInit } from '@nestjs/common'

@Injectable()
export class MinioService implements OnModuleInit {
  constructor(@Inject('MINIO') readonly minio: Client) {}

  async onModuleInit() {
    const projects = await this.minio.bucketExists('projects')
    if (!projects) {
      await this.minio.makeBucket('projects')
    }
    const users = await this.minio.bucketExists('users')
    if (!users) {
      await this.minio.makeBucket('users')
    }
  }
}
