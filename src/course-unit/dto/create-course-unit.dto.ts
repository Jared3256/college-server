import {
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class CreateCourseUnitDto {
  @IsOptional()
  @IsMongoId()
  courseId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  courseCode?: string;

  @IsOptional()
  @IsMongoId()
  lecturerId?: string;

  @IsMongoId()
  semesterId: string;

  @IsString()
  @IsNotEmpty()
  unitName: string;

  @IsString()
  @IsNotEmpty()
  unitCode: string;

  @IsNumber()
  @Min(0)
  creditHours: number;

  @IsOptional()
  @IsString()
  description?: string;
}
