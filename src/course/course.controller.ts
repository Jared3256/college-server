import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseDocument } from './entities/course.entity';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @Post()
  async create(@Body() createCourseDto: CreateCourseDto): Promise<CourseDocument> {
    return this.courseService.create(createCourseDto);
  }

  @Get()
  async findAll(): Promise<CourseDocument[]> {
    return this.courseService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CourseDocument> {
    return this.courseService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
  ): Promise<CourseDocument> {
    return this.courseService.update(id, updateCourseDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<CourseDocument> {
    return this.courseService.remove(id);
  }
}
