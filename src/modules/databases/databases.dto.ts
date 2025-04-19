import { IsString, IsInt, IsEnum, IsOptional, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { BackupInterval, DbType } from '@prisma/client';

export class CreateDatabaseDto {
  @ApiProperty({ description: 'Name of the database', default: 'База данных тестовая', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Type of the database', enum: DbType })
  @IsEnum(DbType)
  @IsNotEmpty()
  type: DbType;

  @ApiProperty({ description: 'Database host address' })
  @IsString()
  @IsNotEmpty()
  host: string;

  @ApiProperty({ description: 'Database port number' })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsNotEmpty()
  port: number;

  @ApiProperty({ description: 'Database username' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ description: 'Database password' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty({ description: 'Name of the database in the DBMS' })
  @IsString()
  @IsNotEmpty()
  databaseName: string;

  @ApiProperty({ description: 'Backup interval', enum: BackupInterval })
  @IsEnum(BackupInterval)
  @IsNotEmpty()
  backupInterval: BackupInterval;
}

export class UpdateDatabaseDto {
  @ApiProperty({ description: 'Name of the database', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ description: 'Type of the database', enum: DbType, required: false })
  @IsEnum(DbType)
  @IsOptional()
  type?: DbType;

  @ApiProperty({ description: 'Database host address', required: false })
  @IsString()
  @IsOptional()
  host?: string;

  @ApiProperty({ description: 'Database port number', required: false })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @IsOptional()
  port?: number;

  @ApiProperty({ description: 'Database username', required: false })
  @IsString()
  @IsOptional()
  username?: string;

  @ApiProperty({ description: 'Database password', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ description: 'Name of the database in the DBMS', required: false })
  @IsString()
  @IsOptional()
  databaseName?: string;

  @ApiProperty({ description: 'Backup interval', enum: BackupInterval, required: false })
  @IsEnum(BackupInterval)
  @IsOptional()
  backupInterval?: BackupInterval;
}