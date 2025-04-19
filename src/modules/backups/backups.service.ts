import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { FilesService } from '../files/files.service';
import { Readable } from 'stream';
import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import { Cron, CronExpression } from '@nestjs/schedule';
import { RestorePostgresDto } from './backups.dto';

const execAsync = promisify(exec);

@Injectable()
export class BackupsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly filesService: FilesService,
    ) {
        // this.handleScheduledBackups().then(e => console.log(e))
        // this.restorePostgres("95939639-fcef-4ace-824b-a3df354943a9", "a6178bbe-5b1f-41c7-975a-f59670ec04cc").then(e => console.log(e))
    }

    private async isBackupNeeded(databaseId: string): Promise<boolean> {
        const database = await this.prisma.database.findUnique({
            where: { id: databaseId },
        });

        if (!database) {
            throw new NotFoundException(`Database with ID ${databaseId} not found`);
        }

        if (!database.lastBackup) {
            return true;
        }

        const now = new Date();
        const lastBackup = new Date(database.lastBackup);
        const interval = database.backupInterval;

        const timeDiff = now.getTime() - lastBackup.getTime();
        const intervals = {
            HOURLY: 60 * 60 * 1000, // 1 hour in milliseconds
            DAILY: 24 * 60 * 60 * 1000, // 1 day
            WEEKLY: 7 * 24 * 60 * 60 * 1000, // 1 week
            MONTHLY: 30 * 24 * 60 * 60 * 1000, // ~1 month
        };

        return timeDiff >= intervals[interval];
    }

    async createBackup(databaseId: string, stream: Readable): Promise<{ id: string; key: string; etag: string }> {
        const isNeeded = await this.isBackupNeeded(databaseId);
        if (!isNeeded) {
            throw new BadRequestException('Backup is not needed yet based on the interval');
        }

        const database = await this.prisma.database.findUnique({
            where: { id: databaseId },
        });
        if (!database) {
            throw new NotFoundException(`Database with ID ${databaseId} not found`);
        }

        try {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const backupKey = `${databaseId}/${timestamp}`;
            const bucket = 'backups';

            const { etag } = await this.filesService.upload(databaseId, backupKey, stream);

            const backup = await this.prisma.backup.create({
                data: {
                    databaseId,
                    key: backupKey,
                    bucket,
                    etag
                },
            });

            await this.prisma.database.update({
                where: { id: databaseId },
                data: { lastBackup: new Date() },
            });

            return { id: backup.id, key: backup.key, etag: backup.etag };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to create backup: ${error.message}`);
        }
    }

    async list(databaseId: string): Promise<{ id: string; key: string; etag: string; createdAt: Date }[]> {
        const database = await this.prisma.database.findUnique({
            where: { id: databaseId },
        });
        if (!database) {
            throw new NotFoundException(`Database with ID ${databaseId} not found`);
        }

        return this.prisma.backup.findMany({
            where: { databaseId },
            select: {
                id: true,
                key: true,
                etag: true,
                createdAt: true,
            },
        });
    }

    //   async downloadBackup(backupId: string): Promise<Readable> {
    //     const backup = await this.prisma.backup.findUnique({
    //       where: { id: backupId },
    //     });
    //     if (!backup) {
    //       throw new NotFoundException(`Backup with ID ${backupId} not found`);
    //     }

    //     try {
    //       return await this.filesService.download(backup.key, backup.bucket);
    //     } catch (error) {
    //       throw new InternalServerErrorException(`Failed to download backup: ${error.message}`);
    //     }
    //   }

    private async backupPostgres(databaseId: string): Promise<{ id: string; key: string; etag: string }> {
        const database = await this.prisma.database.findUnique({
            where: { id: databaseId },
        });
        if (!database) {
            throw new NotFoundException(`Database with ID ${databaseId} not found`);
        }
        if (database.type !== 'postgresql') {
            throw new BadRequestException('Database is not PostgreSQL');
        }

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupKey = `${timestamp}.backup`; // Изменено расширение на .backup для --format=c

        const env = { ...process.env, PGPASSWORD: database.password };

        return new Promise((resolve, reject) => {
            // Путь к pg_dump (можно задать в .env или использовать дефолтный pg_dump)
            const pgDumpPath = process.env.PG_DUMP_PATH || 'pg_dump';

            const pgDump = spawn(pgDumpPath, [
                '--host', database.host,
                '--port', database.port.toString(),
                '--username', database.username,
                '--no-password',
                '--format=c',
                '--large-objects',
                '--verbose',
                '--schema', 'public',
                database.databaseName,
            ], { env });

            let stderr = '';
            pgDump.stderr.on('data', (data) => {
                stderr += data.toString();
                console.log('pg_dump stderr:', data.toString()); // Логируем для отладки
            });

            pgDump.on('error', (error) => {
                reject(new InternalServerErrorException(`pg_dump error: ${error.message}`));
            });

            pgDump.on('close', async (code) => {
                if (code !== 0) {
                    return reject(new InternalServerErrorException(`pg_dump failed: ${stderr}`));
                }
            });

            // Загружаем stream в Minio
            this.filesService.upload(databaseId, backupKey, pgDump.stdout)
                .then(async ({ etag }) => {
                    const backup = await this.prisma.backup.create({
                        data: {
                            databaseId,
                            key: backupKey,
                            bucket: 'backups',
                            etag,
                        },
                    });

                    await this.prisma.database.update({
                        where: { id: databaseId },
                        data: { lastBackup: new Date() },
                    });

                    resolve({ id: backup.id, key: backup.key, etag });
                })
                .catch((uploadError) => {
                    reject(new InternalServerErrorException(`Failed to upload backup: ${uploadError.message}`));
                });
        });
    }

    @Cron(CronExpression.EVERY_MINUTE)
    async handleScheduledBackups() {
        try {
            const databases = await this.prisma.database.findMany();

            for (const database of databases) {
                if (await this.isBackupNeeded(database.id)) {
                    if (database.type === 'postgresql') {
                        await this.backupPostgres(database.id);
                    } else if (database.type === 'mongo') {
                        // await this.backupMongo(database.id);
                    }
                }
            }
        } catch (error) {
            console.error('Scheduled backup failed:', error.message);
        }
    }

    async restorePostgres(databaseId: string, backupId: string, { newDbHost, newDbName, newDbPassword, newDbPort, newDbUserName }: RestorePostgresDto): Promise<void> {
        const database = await this.prisma.database.findUnique({
            where: { id: databaseId },
        });
        if (!database) {
            throw new NotFoundException(`Database with ID ${databaseId} not found`);
        }
        if (database.type !== 'postgresql') {
            throw new BadRequestException('Database is not PostgreSQL');
        }

        const backup = await this.prisma.backup.findUnique({
            where: { id: backupId },
        });
        if (!backup) {
            throw new NotFoundException(`Backup with ID ${backupId} not found`);
        }

        try {
            // Получаем поток бэкапа из Minio
            const stream = await this.filesService.download(backup.key, 'backups');

            // Путь к pg_restore
            console.log('process.env.PATH:', process.env.PATH);

            const pgRestorePath = process.env.PG_RESTORE_PATH || 'pg_restore';

            // Формируем команду для pg_restore
            return new Promise((resolve, reject) => {
                const pgRestore = spawn(pgRestorePath,
                    [
                        '--host', newDbHost,
                        '--port', newDbPort,
                        '--username', newDbUserName,
                        '--dbname', newDbName,
                        '--no-password',
                        '--verbose',
                    ],
                    {
                        env: {
                            PGPASSWORD: newDbPassword
                        },
                    });

                // Передаём поток бэкапа в stdin процесса pg_restore
                stream.pipe(pgRestore.stdin);

                let stderr = '';
                pgRestore.stderr.on('data', (data) => {
                    stderr += data.toString();
                    console.log('pg_restore stderr:', data.toString()); // Логируем для отладки
                });

                pgRestore.on('error', (error) => {
                    reject(new InternalServerErrorException(`pg_restore error: ${error.message}`));
                });

                pgRestore.on('close', (code) => {
                    if (code !== 0) {
                        reject(new InternalServerErrorException(`pg_restore failed: ${stderr}`));
                    } else {
                        resolve();
                    }
                });
            });
        } catch (error) {
            if (error.message.includes('not found') || error.message.includes('не является')) {
                throw new InternalServerErrorException('pg_restore command failed. Ensure pg_restore is installed and available in PATH.');
            }
            throw new InternalServerErrorException(`Failed to restore PostgreSQL database: ${error.message}`);
        }
    }

    async downloadBackup(backupId: string): Promise<Readable> {
        const backup = await this.prisma.backup.findUnique({
            where: {
                id: backupId,
            },
            include: {
                database: true
            }
        })
        try {
            return await this.filesService.download(backup.database.id, backup.key);
        } catch (error) {
            if (error instanceof NotFoundException) {
                throw new NotFoundException(`Backup with ID ${backupId} not found`);
            }
            throw error;
        }
    }
}