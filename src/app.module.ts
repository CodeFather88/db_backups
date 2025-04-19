import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './modules/databases/databases.module';
import { BackupsModule } from './modules/backups/backups.module';
import { PrismaModule } from './core/prisma/prisma.module';
import { MinioModule } from './core/minio/minio.module';
import { ConfigModule } from '@nestjs/config';
import { FilesModule } from './modules/files/files.module';

@Module({
  imports: [
    DatabaseModule, 
    BackupsModule, 
    PrismaModule,
    MinioModule,
    ConfigModule,
    FilesModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
