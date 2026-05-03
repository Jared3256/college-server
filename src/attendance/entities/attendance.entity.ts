import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum AttendanceStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
  LATE = 'LATE',
  EXCUSED = 'EXCUSED',
}

export type AttendanceDocument = HydratedDocument<Attendance>;

@Schema({
  collection: 'attendance',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Attendance {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lecturer', required: true })
  lecturerId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'CourseUnit',
    required: true,
    index: true,
  })
  courseUnitId: Types.ObjectId;

  @Prop({ required: true, index: true })
  date: Date;

  @Prop({ required: true, enum: AttendanceStatus })
  status: AttendanceStatus;

  @Prop({ trim: true })
  remarks?: string;
}

export const AttendanceSchema = SchemaFactory.createForClass(Attendance);
AttendanceSchema.index({ studentId: 1, courseUnitId: 1, date: 1 });
