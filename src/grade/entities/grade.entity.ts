import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GradeDocument = HydratedDocument<Grade>;

@Schema({
  collection: 'grades',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Grade {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Assessment', required: true })
  assessmentId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CourseUnit',
    required: true,
    index: true,
  })
  courseUnitId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  marksScored: number;

  @Prop({ required: true, trim: true })
  grade: string;

  @Prop({ trim: true })
  remarks?: string;

  @Prop({ type: Types.ObjectId, ref: 'Lecturer', required: true })
  gradedBy: Types.ObjectId;
}

export const GradeSchema = SchemaFactory.createForClass(Grade);
GradeSchema.index({ studentId: 1, courseUnitId: 1 });
GradeSchema.index({ studentId: 1, assessmentId: 1 }, { unique: true });
