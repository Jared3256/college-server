import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CreateLecturerDto } from './dto/create-lecturer.dto';
import { UpdateLecturerDto } from './dto/update-lecturer.dto';
import { LecturerDocument } from './entities/lecturer.entity';
import { LecturerService } from './lecturer.service';

@Controller('lecturers')
export class LecturerController {
  constructor(private readonly lecturerService: LecturerService) {}

  @Post()
  async create(
    @Body() createLecturerDto: CreateLecturerDto,
  ): Promise<LecturerDocument> {
    return this.lecturerService.create(createLecturerDto);
  }

  @Get()
  async findAll(): Promise<LecturerDocument[]> {
    return this.lecturerService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LecturerDocument> {
    return this.lecturerService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateLecturerDto: UpdateLecturerDto,
  ): Promise<LecturerDocument> {
    return this.lecturerService.update(id, updateLecturerDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<LecturerDocument> {
    return this.lecturerService.remove(id);
  }
}
