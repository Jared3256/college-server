import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsOptional, IsString } from 'class-validator';
import {
  CreateExamAttendanceDto,
  CreateExamDto,
  CreateExamEligibilityDto,
  CreateExamMalpracticeDto,
  CreateExamModerationDto,
  CreateExamQuestionDto,
  CreateExamResultDto,
  CreateExamSessionDto,
} from './create-exam.dto';

export class UpdateExamDto extends PartialType(CreateExamDto) {
  @IsOptional()
  @IsMongoId()
  updatedBy?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class UpdateExamSessionDto extends PartialType(CreateExamSessionDto) {}

export class UpdateExamEligibilityDto extends PartialType(
  CreateExamEligibilityDto,
) {}

export class UpdateExamQuestionDto extends PartialType(CreateExamQuestionDto) {}

export class UpdateExamResultDto extends PartialType(CreateExamResultDto) {
  @IsMongoId()
  modifiedBy: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class UpdateExamModerationDto extends PartialType(
  CreateExamModerationDto,
) {}

export class UpdateExamAttendanceDto extends PartialType(
  CreateExamAttendanceDto,
) {}

export class UpdateExamMalpracticeDto extends PartialType(
  CreateExamMalpracticeDto,
) {
  @IsMongoId()
  updatedBy: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
