import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseUnitDocument = HydratedDocument<CourseUnit>;

@Schema({
  collection: 'course_units',
  timestamps: { createdAt: true, updatedAt: false },
})
export class CourseUnit {
  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lecturer', required: true, index: true })
  lecturerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Semester', required: true, index: true })
  semesterId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  unitName: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  unitCode: string;

  @Prop({ required: true, min: 0 })
  creditHours: number;

  @Prop({ trim: true })
  description?: string;
}

export const CourseUnitSchema = SchemaFactory.createForClass(CourseUnit);
