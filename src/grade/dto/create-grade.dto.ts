import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsMongoId,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { GradeStatus } from '../entities/grade.entity';

export class CreateGradeDto {
  @IsMongoId()
  studentId: string;

  @IsMongoId()
  courseUnitId: string;

  @IsMongoId()
  examId: string;

  @IsNumber()
  @Min(0)
  marksScored: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsMongoId()
  enteredBy: string;
}

export class BulkGradeItemDto {
  @IsMongoId()
  studentId: string;

  @IsNumber()
  @Min(0)
  marksScored: number;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class BulkCreateGradeDto {
  @IsMongoId()
  examId: string;

  @IsOptional()
  @IsMongoId()
  courseUnitId?: string;

  @IsMongoId()
  enteredBy: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkGradeItemDto)
  grades: BulkGradeItemDto[];
}

export class SubmitGradeDto {
  @IsMongoId()
  submittedBy: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class UpdateGradeDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  marksScored?: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsMongoId()
  modifiedBy: string;

  @IsOptional()
  @IsEnum(GradeStatus)
  status?: GradeStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class PublishGradeDto {
  @IsMongoId()
  publishedBy: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class StudentGradesQueryDto {
  @IsMongoId()
  viewerUserId: string;

  @IsOptional()
  @IsMongoId()
  semesterId?: string;

  @IsOptional()
  @IsMongoId()
  courseUnitId?: string;

  @IsOptional()
  @Transform(
    ({ value }: { value: unknown }) => value === true || value === 'true',
  )
  @IsBoolean()
  publishedOnly?: boolean;
}

export class CourseUnitGradesQueryDto {
  @IsMongoId()
  viewerUserId: string;

  @IsOptional()
  @IsEnum(GradeStatus)
  status?: GradeStatus;

  @IsOptional()
  @Transform(
    ({ value }: { value: unknown }) => value === true || value === 'true',
  )
  @IsBoolean()
  publishedOnly?: boolean;
}

export class GradeResponseDto<TData = unknown> {
  success: boolean;
  message?: string;
  data?: TData;
}

export class GradeIdentifierResponseDto {
  gradeId: string;
  status: GradeStatus;
}

export class BulkGradeResponseDto {
  createdCount: number;
  grades: GradeIdentifierResponseDto[];
}
