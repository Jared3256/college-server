import { PartialType } from '@nestjs/mapped-types';
import { CreateLecturerDto, UpdateLecturerUserDto } from './create-lecturer.dto';

export class UpdateLecturerDto extends PartialType(CreateLecturerDto) {}
export class UpdateUserLectureDto extends PartialType (UpdateLecturerUserDto){}