import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsEnum,
  IsInt,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import {
  ExamApprovalStatus,
  ExamAttendanceStatus,
  ExamAttemptStatus,
  ExamDifficultyLevel,
  ExamGradingStatus,
  ExamMalpracticeStatus,
  ExamMode,
  ExamModerationStatus,
  ExamPublicationVisibility,
  ExamQuestionType,
  ExamSessionStatus,
  ExamType,
} from '../entities/exam.entity';

export class CreateExamDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsMongoId()
  courseUnitId: string;

  @IsMongoId()
  semesterId: string;

  @IsEnum(ExamType)
  examType: ExamType;

  @IsNumber()
  @Min(0)
  totalMarks: number;

  @IsNumber()
  @Min(0)
  passingMarks: number;

  @IsInt()
  @Min(1)
  durationMinutes: number;

  @IsOptional()
  @IsString()
  instructions?: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  examWeightPercentage: number;

  @IsOptional()
  @IsBoolean()
  isPublished?: boolean;

  @IsOptional()
  @IsBoolean()
  requiresApproval?: boolean;

  @IsOptional()
  @IsEnum(ExamApprovalStatus)
  approvalStatus?: ExamApprovalStatus;

  @IsMongoId()
  createdBy: string;

  @IsOptional()
  @IsMongoId()
  approvedBy?: string;
}

export class UpdateExamApprovalDto {
  @IsEnum(ExamApprovalStatus)
  approvalStatus: ExamApprovalStatus;

  @IsOptional()
  @IsMongoId()
  approvedBy?: string;

  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class ArchiveExamDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}

export class CreateExamSessionDto {
  @IsDateString()
  sessionDate: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime: string;

  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime: string;

  @IsString()
  @IsNotEmpty()
  room: string;

  @IsEnum(ExamMode)
  mode: ExamMode;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  invigilators?: string[];

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsEnum(ExamSessionStatus)
  status?: ExamSessionStatus;
}

export class CreateExamEligibilityDto {
  @IsMongoId()
  studentId: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  attendancePercentage: number;

  @IsBoolean()
  feeCleared: boolean;

  @IsBoolean()
  disciplinaryClearance: boolean;

  @IsOptional()
  @IsString()
  remarks?: string;
}

export class CreateExamQuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsEnum(ExamQuestionType)
  questionType: ExamQuestionType;

  @IsNumber()
  @Min(0)
  marks: number;

  @IsOptional()
  @IsArray()
  options?: unknown[];

  @IsOptional()
  correctAnswer?: unknown;

  @IsOptional()
  @IsString()
  explanation?: string;

  @IsEnum(ExamDifficultyLevel)
  difficultyLevel: ExamDifficultyLevel;

  @IsInt()
  @Min(1)
  order: number;
}

export class CreateExamAttemptDto {
  @IsMongoId()
  studentId: string;

  @IsMongoId()
  examSessionId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  attemptNumber?: number;

  @IsOptional()
  @IsEnum(ExamAttemptStatus)
  status?: ExamAttemptStatus;

  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsObject()
  deviceMetadata?: Record<string, unknown>;
}

export class StartExamAttemptDto {
  @IsOptional()
  @IsString()
  ipAddress?: string;

  @IsOptional()
  @IsObject()
  deviceMetadata?: Record<string, unknown>;
}

export class ExamSubmissionResponseDto {
  @IsMongoId()
  questionId: string;

  @IsOptional()
  answer?: unknown;

  @IsOptional()
  @IsNumber()
  @Min(0)
  marksAwarded?: number;

  @IsOptional()
  @IsString()
  feedback?: string;
}

export class AutoSaveExamSubmissionDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamSubmissionResponseDto)
  responses: ExamSubmissionResponseDto[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];
}

export class SubmitExamSubmissionDto extends AutoSaveExamSubmissionDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationSpent?: number;

  @IsOptional()
  @IsDateString()
  submittedAt?: string;
}

export class CreateExamResultDto {
  @IsMongoId()
  studentId: string;

  @IsNumber()
  @Min(0)
  rawScore: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  adjustedScore?: number;

  @IsString()
  @IsNotEmpty()
  grade: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  GPAContribution?: number;

  @IsOptional()
  @IsString()
  remarks?: string;

  @IsMongoId()
  gradedBy: string;

  @IsOptional()
  @IsEnum(ExamGradingStatus)
  gradingStatus?: ExamGradingStatus;
}

export class CreateExamModerationDto {
  @IsMongoId()
  moderatorId: string;

  @IsString()
  @IsNotEmpty()
  findings: string;

  @IsOptional()
  @IsString()
  recommendations?: string;

  @IsOptional()
  @IsEnum(ExamModerationStatus)
  status?: ExamModerationStatus;
}

export class CreateExamAttendanceDto {
  @IsMongoId()
  studentId: string;

  @IsEnum(ExamAttendanceStatus)
  attendanceStatus: ExamAttendanceStatus;

  @IsOptional()
  @IsDateString()
  checkedInAt?: string;

  @IsMongoId()
  verifiedBy: string;
}

export class CreateExamMalpracticeDto {
  @IsMongoId()
  studentId: string;

  @IsMongoId()
  reportedBy: string;

  @IsString()
  @IsNotEmpty()
  incidentType: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceFiles?: string[];

  @IsOptional()
  @IsString()
  actionTaken?: string;

  @IsOptional()
  @IsEnum(ExamMalpracticeStatus)
  status?: ExamMalpracticeStatus;
}

export class PublishExamResultsDto {
  @IsMongoId()
  publishedBy: string;

  @IsEnum(ExamPublicationVisibility)
  visibility: ExamPublicationVisibility;

  @IsOptional()
  @IsBoolean()
  notificationSent?: boolean;

  @IsOptional()
  @IsString()
  ipAddress?: string;
}
