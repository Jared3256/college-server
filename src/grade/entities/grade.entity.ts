import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type GradeDocument = HydratedDocument<Grade>;

export enum GradeStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PUBLISHED = 'PUBLISHED',
}

@Schema({
  collection: 'grades',
  timestamps: true,
})
export class Grade {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Assessment' })
  assessmentId?: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CourseUnit',
    required: true,
    index: true,
  })
  courseUnitId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Exam', required: true, index: true })
  examId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  marksScored: number;

  @Prop({ required: true, trim: true })
  grade: string;

  @Prop({ required: true, min: 0 })
  GPAContribution: number;

  @Prop({ trim: true })
  remarks?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  enteredBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop({
    required: true,
    enum: GradeStatus,
    default: GradeStatus.DRAFT,
    index: true,
  })
  status: GradeStatus;

  @Prop({ required: true, default: false, index: true })
  visibleToStudent: boolean;

  @Prop({ type: Types.ObjectId, ref: 'Lecturer' })
  gradedBy?: Types.ObjectId;
}

export const GradeSchema = SchemaFactory.createForClass(Grade);
GradeSchema.index({ studentId: 1, courseUnitId: 1 });
GradeSchema.index({ studentId: 1, examId: 1 }, { unique: true });
GradeSchema.index({ studentId: 1, assessmentId: 1 });
GradeSchema.index({ courseUnitId: 1, status: 1 });
GradeSchema.index({ studentId: 1, visibleToStudent: 1 });
