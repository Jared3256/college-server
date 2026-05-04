import { PartialType } from '@nestjs/mapped-types';
import { CreateCourseUnitDto } from './create-course-unit.dto';

export class UpdateCourseUnitDto extends PartialType(CreateCourseUnitDto) {}
