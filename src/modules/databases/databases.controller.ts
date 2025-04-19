import { Controller, Get, Post, Put, Delete, Param, Body, NotFoundException } from '@nestjs/common';
import { DatabaseService } from './databases.service';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CreateDatabaseDto, UpdateDatabaseDto } from './databases.dto';

@ApiTags('databases')
@Controller('databases')
export class DatabaseController {
  constructor(private readonly databaseService: DatabaseService) {}

  @Get()
  @ApiOperation({ summary: 'Get all databases' })
  @ApiResponse({ status: 200, description: 'List of all databases' })
  async findAll() {
    return this.databaseService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get database by ID' })
  @ApiResponse({ status: 200, description: 'Database found' })
  @ApiResponse({ status: 404, description: 'Database not found' })
  async findOne(@Param('id') id: string) {
    const database = await this.databaseService.findOne(id);
    if (!database) {
      throw new NotFoundException(`Database with ID ${id} not found`);
    }
    return database;
  }

  @Post()
  @ApiOperation({ summary: 'Create a new database' })
  @ApiResponse({ status: 201, description: 'Database created' })
  async create(@Body() createDatabaseDto: CreateDatabaseDto) {
    return this.databaseService.create(createDatabaseDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a database' })
  @ApiResponse({ status: 200, description: 'Database updated' })
  @ApiResponse({ status: 404, description: 'Database not found' })
  async update(@Param('id') id: string, @Body() updateDatabaseDto: UpdateDatabaseDto) {
    const database = await this.databaseService.update(id, updateDatabaseDto);
    if (!database) {
      throw new NotFoundException(`Database with ID ${id} not found`);
    }
    return database;
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a database' })
  @ApiResponse({ status: 204, description: 'Database deleted' })
  @ApiResponse({ status: 404, description: 'Database not found' })
  async remove(@Param('id') id: string) {
    const result = await this.databaseService.remove(id);
    if (!result) {
      throw new NotFoundException(`Database with ID ${id} not found`);
    }
    return { message: 'Database deleted successfully' };
  }
}