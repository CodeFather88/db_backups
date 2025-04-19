import { Controller, Post, Get, Param, Res, Body, StreamableFile, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { BackupsService } from './backups.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { Readable } from 'stream';
import { RestorePostgresDto } from './backups.dto';
import { FastifyReply } from 'fastify';

@ApiTags('backups')
@Controller('backups')
export class BackupsController {
  constructor(private readonly backupsService: BackupsService) {}

  @Get(':databaseId')
  @ApiOperation({ summary: 'List all backups for a database' })
  @ApiResponse({ status: 200, description: 'List of backups' })
  @ApiResponse({ status: 404, description: 'Database not found' })
  async list(@Param('databaseId') databaseId: string) {
    return this.backupsService.list(databaseId);
  }

  @Post(':databaseId/:backupId/restore/postgres')
  @ApiOperation({ summary: 'Restore a PostgreSQL database from a backup' })
  @ApiResponse({ status: 200, description: 'Database restored successfully' })
  @ApiResponse({ status: 404, description: 'Database or backup not found' })
  @ApiResponse({ status: 500, description: 'Failed to restore database' })
  async restorePostgres(
    @Param('databaseId') databaseId: string,
    @Param('backupId') backupId: string,
    @Body() body: RestorePostgresDto
  ) {
    await this.backupsService.restorePostgres(databaseId, backupId, body);
    return { message: 'Database restored successfully' };
  }

  @Get('download/:backupId')
  @ApiOperation({ summary: 'Download a backup by ID' })
  @ApiResponse({ status: 200, description: 'Backup file stream' })
  @ApiResponse({ status: 404, description: 'Backup not found' })
  async download(@Param('backupId') backupId: string, @Res() res: FastifyReply) {
    try {
      // Получаем поток данных бэкапа
      const stream = await this.backupsService.downloadBackup(backupId);

      // Проверяем, является ли stream валидным Readable
      if (!(stream instanceof Readable)) {
        throw new InternalServerErrorException('Invalid stream returned from backup service');
      }

      // Устанавливаем заголовки ответа
      res.header('Content-Disposition', `attachment; filename="backup-${backupId}.backup"`);
      res.header('Content-Type', 'application/octet-stream'); // Используем octet-stream для .backup

      // Обрабатываем ошибки потока
      stream.on('error', (error) => {
        console.error('Stream error:', error);
        if (!res.raw.writableEnded) {
          res.status(500).send('Error streaming backup file');
        }
      });

      // Отправляем поток через Fastify
      res.send(stream);
    } catch (error) {
      // Обработка ошибок
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Download error:', error);
      throw new InternalServerErrorException(`Failed to download backup: ${error.message}`);
    }
  }
}