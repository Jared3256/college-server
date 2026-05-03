import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type CourseDocument = HydratedDocument<Course>;

@Schema({
  collection: 'courses',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Course {
  @Prop({
    type: Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true,
  })
  departmentId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  courseName: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  courseCode: string;

  @Prop({ required: true, min: 1 })
  durationYears: number;

  @Prop({ trim: true })
  description?: string;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
