import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  BulkCreateGradeDto,
  BulkGradeResponseDto,
  CourseUnitGradesQueryDto,
  CreateGradeDto,
  GradeIdentifierResponseDto,
  GradeResponseDto,
  PublishGradeDto,
  StudentGradesQueryDto,
  SubmitGradeDto,
  UpdateGradeDto,
} from './dto/create-grade.dto';
import { GradeDocument } from './entities/grade.entity';
import { GradeService } from './grade.service';

@Controller('api/v1/grades')
export class GradeController {
  constructor(private readonly gradeService: GradeService) {}

  @Post()
  async create(
    @Body() createGradeDto: CreateGradeDto,
  ): Promise<GradeResponseDto<GradeIdentifierResponseDto>> {
    return this.gradeService.create(createGradeDto);
  }

  @Post('bulk')
  async createBulk(
    @Body() bulkDto: BulkCreateGradeDto,
  ): Promise<GradeResponseDto<BulkGradeResponseDto>> {
    return this.gradeService.createBulk(bulkDto);
  }

  @Patch(':gradeId/submit')
  async submit(
    @Param('gradeId') gradeId: string,
    @Body() submitDto: SubmitGradeDto,
  ): Promise<GradeResponseDto<GradeIdentifierResponseDto>> {
    return this.gradeService.submit(gradeId, submitDto);
  }

  @Patch(':gradeId')
  async update(
    @Param('gradeId') gradeId: string,
    @Body() updateDto: UpdateGradeDto,
  ): Promise<GradeResponseDto<GradeIdentifierResponseDto>> {
    return this.gradeService.update(gradeId, updateDto);
  }

  @Patch(':gradeId/publish')
  async publish(
    @Param('gradeId') gradeId: string,
    @Body() publishDto: PublishGradeDto,
  ): Promise<GradeResponseDto<GradeIdentifierResponseDto>> {
    return this.gradeService.publish(gradeId, publishDto);
  }

  @Get('student/:studentId')
  async findByStudent(
    @Param('studentId') studentId: string,
    @Query() queryDto: StudentGradesQueryDto,
  ): Promise<GradeResponseDto<GradeDocument[]>> {
    return this.gradeService.findByStudent(studentId, queryDto);
  }

  @Get('course-unit/:courseUnitId')
  async findByCourseUnit(
    @Param('courseUnitId') courseUnitId: string,
    @Query() queryDto: CourseUnitGradesQueryDto,
  ): Promise<GradeResponseDto<GradeDocument[]>> {
    return this.gradeService.findByCourseUnit(courseUnitId, queryDto);
  }

  @Delete(':gradeId')
  remove(@Param('gradeId') gradeId: string): never {
    return this.gradeService.remove(gradeId);
  }
}
