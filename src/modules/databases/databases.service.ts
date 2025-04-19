import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { CreateDatabaseDto, UpdateDatabaseDto } from './databases.dto';

@Injectable()
export class DatabaseService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.database.findMany();
  }

  async findOne(id: string) {
    return this.prisma.database.findUnique({
      where: { id },
    });
  }

  async create(createDatabaseDto: CreateDatabaseDto) {
    return this.prisma.database.create({
      data: {
        name: createDatabaseDto.name,
        type: createDatabaseDto.type,
        host: createDatabaseDto.host,
        port: createDatabaseDto.port,
        username: createDatabaseDto.username,
        password: createDatabaseDto.password,
        databaseName: createDatabaseDto.databaseName,
        backupInterval: createDatabaseDto.backupInterval,
      },
    });
  }

  async update(id: string, updateDatabaseDto: UpdateDatabaseDto) {
    return this.prisma.database.update({
      where: { id },
      data: {
        name: updateDatabaseDto.name,
        type: updateDatabaseDto.type,
        host: updateDatabaseDto.host,
        port: updateDatabaseDto.port,
        username: updateDatabaseDto.username,
        password: updateDatabaseDto.password,
        databaseName: updateDatabaseDto.databaseName,
        backupInterval: updateDatabaseDto.backupInterval,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.database.delete({
      where: { id },
    });
  }
}