import { PartialType } from '@nestjs/mapped-types';
import { UpdateLecturerUserDto } from './create-lecturer.dto';

export class UpdateLecturerDto extends PartialType(UpdateLecturerUserDto) {}
