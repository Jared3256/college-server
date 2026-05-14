import { IsMongoId, IsOptional } from 'class-validator';

export class RegisterCourseDto {
  @IsMongoId()
  studentId: string;

  @IsMongoId()
  courseId: string;

  @IsOptional()
  @IsMongoId()
  semesterId?: string;
}
