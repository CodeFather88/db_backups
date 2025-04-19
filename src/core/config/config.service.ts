import { Injectable } from '@nestjs/common'
import { ConfigService as NestJsConfigService } from '@nestjs/config'

@Injectable()
export class ConfigService {
  readonly APP_PORT: number
  readonly APP_HOST: string
  readonly JWT_SECRET_KEY: string
  readonly JWT_TOKEN_VALID: string
  readonly REFRESH_TOKEN_VALID_DAYS: number
  readonly REDIS_HOST: string
  readonly REDIS_PORT: number
  readonly REDIS_PASSWORD: string
  readonly MINIO_API: number
  readonly MINIO_USER: string
  readonly MINIO_PASSWORD: string
  readonly MINIO_HOST: string

  constructor(private readonly config: NestJsConfigService) {
    this.APP_PORT = this.config.get<number>('APP_PORT', 3015)
    this.APP_HOST = this.config.get<string>('APP_HOST', '127.0.0.1')

    this.JWT_SECRET_KEY = this.config.getOrThrow<string>('JWT_SECRET_KEY')
    this.JWT_TOKEN_VALID = this.config.getOrThrow<string>('JWT_TOKEN_VALID')
    this.REFRESH_TOKEN_VALID_DAYS = +this.config.getOrThrow<number>('REFRESH_TOKEN_VALID_DAYS')

    this.REDIS_HOST = this.config.get<string>('REDIS_HOST', 'localhost')
    this.REDIS_PORT = +this.config.getOrThrow<number>('REDIS_PORT')
    this.REDIS_PASSWORD = this.config.getOrThrow<string>('REDIS_PASSWORD')

    this.MINIO_API = +this.config.getOrThrow<number>('MINIO_API')
    this.MINIO_USER = this.config.getOrThrow<string>('MINIO_USER')
    this.MINIO_PASSWORD = this.config.getOrThrow<string>('MINIO_PASSWORD')
    this.MINIO_HOST = this.config.getOrThrow<string>('MINIO_HOST')
  }
}
