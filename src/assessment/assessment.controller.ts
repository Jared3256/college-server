import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { AssessmentService } from './assessment.service';
import { CreateAssessmentDto } from './dto/create-assessment.dto';
import { UpdateAssessmentDto } from './dto/update-assessment.dto';
import { AssessmentDocument } from './entities/assessment.entity';

@Controller('assessments')
export class AssessmentController {
  constructor(private readonly assessmentService: AssessmentService) {}

  @Post()
  async create(
    @Body() createDto: CreateAssessmentDto,
  ): Promise<AssessmentDocument> {
    return this.assessmentService.create(createDto);
  }

  @Get()
  async findAll(): Promise<AssessmentDocument[]> {
    return this.assessmentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<AssessmentDocument> {
    return this.assessmentService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateAssessmentDto,
  ): Promise<AssessmentDocument> {
    return this.assessmentService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<AssessmentDocument> {
    return this.assessmentService.remove(id);
  }
}
