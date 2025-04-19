import { Module } from '@nestjs/common';
import { DatabaseService } from './databases.service';
import { DatabaseController } from './databases.controller';

@Module({
  controllers: [DatabaseController],
  providers: [DatabaseService],
})
export class DatabaseModule {}
