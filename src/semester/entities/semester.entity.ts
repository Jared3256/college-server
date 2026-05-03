import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SemesterDocument = HydratedDocument<Semester>;

@Schema({
  collection: 'semesters',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Semester {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true, index: true })
  academicYear: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ default: false, index: true })
  isActive: boolean;
}

export const SemesterSchema = SchemaFactory.createForClass(Semester);
