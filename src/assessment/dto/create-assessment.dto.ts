import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { AssessmentType } from '../entities/assessment.entity';

export class CreateCourseUnitForAssessmentDto {
  @IsOptional()
  @IsMongoId()
  courseId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  courseCode?: string;

  @IsString()
  @IsNotEmpty()
  unitName: string;

  @IsString()
  @IsNotEmpty()
  unitCode: string;

  @IsMongoId()
  semesterId: string;

  @IsNumber()
  @Min(0)
  creditHours: number;

  @IsOptional()
  @IsMongoId()
  lecturerId?: string;
}

export class CreateAssessmentDto {
  @IsOptional()
  @IsMongoId()
  courseUnitId?: string;

  @IsOptional()
  @IsString()
  unitCode?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCourseUnitForAssessmentDto)
  courseUnit?: CreateCourseUnitForAssessmentDto;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsEnum(AssessmentType)
  type: AssessmentType;

  @IsNumber()
  @Min(0)
  totalMarks: number;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsMongoId()
  createdBy: string;
}
