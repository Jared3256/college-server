import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum AcademicStatus {
  ACTIVE = 'ACTIVE',
  DEFERRED = 'DEFERRED',
  SUSPENDED = 'SUSPENDED',
  GRADUATED = 'GRADUATED',
  WITHDRAWN = 'WITHDRAWN',
}

export class GuardianContact {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true, trim: true })
  phoneNumber: string;

  @Prop({ trim: true })
  relationship?: string;
}

export type StudentDocument = HydratedDocument<Student>;

@Schema({ collection: 'students', timestamps: true })
export class Student {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true, index: true })
  admissionNumber: string;

  @Prop({ trim: true })
  nationalId?: string;

  @Prop({ trim: true })
  gender?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true, index: true })
  courseId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true,
  })
  departmentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Semester' })
  semesterId?: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  currentYear: number;

  @Prop({ type: [GuardianContact], default: [] })
  guardianContacts: GuardianContact[];

  @Prop({ trim: true })
  address?: string;

  @Prop({ default: Date.now })
  enrollmentDate: Date;

  @Prop({ enum: AcademicStatus, default: AcademicStatus.ACTIVE })
  academicStatus: AcademicStatus;

  @Prop({ trim: true })
  profileImage?: string;
}

export const StudentSchema = SchemaFactory.createForClass(Student);
