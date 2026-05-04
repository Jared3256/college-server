import {
  IsDateString,
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateLecturerUserDto {
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

export class CreateLecturerDto {
  @IsOptional()
  @IsMongoId()
  userId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLecturerUserDto)
  user?: CreateLecturerUserDto;

  @IsMongoId()
  departmentId: string;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsDateString()
  employmentDate?: string;
}
