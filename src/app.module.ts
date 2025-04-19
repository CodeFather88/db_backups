import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { DatabaseModule } from './modules/databases/databases.module';
import { BackupsModule } from './modules/backups/backups.module';
import { PrismaModule } from './core/prisma/prisma.module';

@Module({
  imports: [DatabaseModule, BackupsModule, PrismaModule],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
