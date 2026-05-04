import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { CourseUnitService } from './course-unit.service';
import { CreateCourseUnitDto } from './dto/create-course-unit.dto';
import { UpdateCourseUnitDto } from './dto/update-course-unit.dto';
import { CourseUnitDocument } from './entities/course-unit.entity';

@Controller('course-units')
export class CourseUnitController {
  constructor(private readonly courseUnitService: CourseUnitService) {}

  @Post()
  async create(
    @Body() createCourseUnitDto: CreateCourseUnitDto,
  ): Promise<CourseUnitDocument> {
    return this.courseUnitService.create(createCourseUnitDto);
  }

  @Get()
  async findAll(): Promise<CourseUnitDocument[]> {
    return this.courseUnitService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<CourseUnitDocument> {
    return this.courseUnitService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateCourseUnitDto: UpdateCourseUnitDto,
  ): Promise<CourseUnitDocument> {
    return this.courseUnitService.update(id, updateCourseUnitDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<CourseUnitDocument> {
    return this.courseUnitService.remove(id);
  }
}
