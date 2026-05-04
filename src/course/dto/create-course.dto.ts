import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateDepartmentForCourseDto {
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

export class CreateCourseDto {
  @IsOptional()
  @IsMongoId()
  departmentId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateDepartmentForCourseDto)
  department?: CreateDepartmentForCourseDto;

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
