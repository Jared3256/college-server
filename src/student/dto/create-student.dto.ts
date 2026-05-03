import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsDateString,
  IsDefined,
  IsEmail,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AcademicStatus } from '../entities/student.entity';

export class CreateStudentUserDto {
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsString()
  @MinLength(8)
  password: string;
}

export class CreateGuardianContactDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @IsOptional()
  @IsString()
  relationship?: string;
}

export class CreateDepartmentForStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMongoId()
  hodId?: string;
}

export class CreateCourseForStudentDto {
  @IsString()
  @IsNotEmpty()
  courseName: string;

  @IsString()
  @IsNotEmpty()
  courseCode: string;

  @IsNumber()
  @Min(1)
  durationYears: number;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateSemesterForStudentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  academicYear: string;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class CreateStudentDto {
  @IsDefined()
  @ValidateNested()
  @Type(() => CreateStudentUserDto)
  user: CreateStudentUserDto;

  @IsString()
  @IsNotEmpty()
  admissionNumber: string;

  @IsOptional()
  @IsString()
  nationalId?: string;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsMongoId()
  courseId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateCourseForStudentDto)
  course?: CreateCourseForStudentDto;

  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDepartmentForStudentDto)
  department?: CreateDepartmentForStudentDto;

  @IsOptional()
  @IsMongoId()
  semesterId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateSemesterForStudentDto)
  semester?: CreateSemesterForStudentDto;

  @IsNumber()
  @Min(1)
  currentYear: number;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateGuardianContactDto)
  guardianContacts?: CreateGuardianContactDto[];

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsDateString()
  enrollmentDate?: string;

  @IsOptional()
  @IsEnum(AcademicStatus)
  academicStatus?: AcademicStatus;

  @IsOptional()
  @IsString()
  profileImage?: string;
}
