import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { StudentDocument } from '../student/entities/student.entity';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { RegisterCourseDto } from './dto/register-course.dto';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto';
import { EnrollmentDocument } from './entities/enrollment.entity';
import { EnrollmentService } from './enrollment.service';

@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Post('course')
  async registerCourse(
    @Body() registerCourseDto: RegisterCourseDto,
  ): Promise<StudentDocument> {
    return this.enrollmentService.registerCourse(registerCourseDto);
  }

  @Post()
  async create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
  ): Promise<EnrollmentDocument> {
    return this.enrollmentService.create(createEnrollmentDto);
  }

  @Get()
  async findAll(): Promise<EnrollmentDocument[]> {
    return this.enrollmentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<EnrollmentDocument> {
    return this.enrollmentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateEnrollmentDto: UpdateEnrollmentDto,
  ): Promise<EnrollmentDocument> {
    return this.enrollmentService.update(id, updateEnrollmentDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<never> {
    return this.enrollmentService.remove(id);
  }
}
