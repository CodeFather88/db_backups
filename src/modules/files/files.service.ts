import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { MinioService } from 'src/core/minio/minio.service';
import { Readable } from 'stream';

@Injectable()
export class FilesService {
    constructor(private readonly minio: MinioService) { }

    async upload(prefix: string, id: string, stream: Readable) {
        try {
            const result = await this.minio.minio.putObject('backups', `${prefix}/${id}`, stream);
            return { etag: result.etag };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to upload file: ${error.message}`);
        }
    }

    async list(bucket: "backups", prefix: string): Promise<{ key: string; size: number }[]> {
        try {
            const objects: { key: string; size: number }[] = [];
            const stream = this.minio.minio.listObjectsV2(bucket, prefix, true);

            return new Promise((resolve, reject) => {
                stream.on('data', (obj) => {
                    if (obj.name) {
                        objects.push({ key: obj.name, size: obj.size });
                    }
                });
                stream.on('error', (error) => {
                    reject(new InternalServerErrorException(`Failed to list files: ${error.message}`));
                });
                stream.on('end', () => {
                    resolve(objects);
                });
            });
        } catch (error) {
            throw new InternalServerErrorException(`Failed to list files: ${error.message}`);
        }
    }

    async download(prefix: string, key: string, bucket: "backups" = "backups"): Promise<Readable> {
        try {
            // Проверяем существование объекта
            await this.minio.minio.statObject(bucket, `${prefix}/${key}`);

            // Получаем поток объекта
            const stream = await this.minio.minio.getObject(bucket, `${prefix}/${key}`);
            return stream;
        } catch (error) {
            if (error.code === 'NotFound') {
                throw new NotFoundException(`File with key ${key} not found in bucket ${bucket}`);
            }
            throw new InternalServerErrorException(`Failed to download file: ${error.message}`);
        }
    }
}
