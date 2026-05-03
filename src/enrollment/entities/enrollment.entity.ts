import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum EnrollmentStatus {
  ACTIVE = 'ACTIVE',
  DROPPED = 'DROPPED',
  COMPLETED = 'COMPLETED',
  WITHDRAWN = 'WITHDRAWN',
}

export type EnrollmentDocument = HydratedDocument<Enrollment>;

@Schema({
  collection: 'enrollments',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CourseUnit',
    required: true,
    index: true,
  })
  courseUnitId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Semester', required: true, index: true })
  semesterId: Types.ObjectId;

  @Prop({ default: Date.now })
  enrollmentDate: Date;

  @Prop({
    required: true,
    enum: EnrollmentStatus,
    default: EnrollmentStatus.ACTIVE,
  })
  status: EnrollmentStatus;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
EnrollmentSchema.index(
  { studentId: 1, courseUnitId: 1, semesterId: 1 },
  { unique: true },
);
