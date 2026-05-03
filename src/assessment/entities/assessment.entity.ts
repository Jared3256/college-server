import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum AssessmentType {
  CAT = 'CAT',
  ASSIGNMENT = 'ASSIGNMENT',
  EXAM = 'EXAM',
  PROJECT = 'PROJECT',
  PRACTICAL = 'PRACTICAL',
}

export type AssessmentDocument = HydratedDocument<Assessment>;

@Schema({
  collection: 'assessments',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Assessment {
  @Prop({
    type: Types.ObjectId,
    ref: 'CourseUnit',
    required: true,
    index: true,
  })
  courseUnitId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true, enum: AssessmentType })
  type: AssessmentType;

  @Prop({ required: true, min: 0 })
  totalMarks: number;

  @Prop()
  dueDate?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Lecturer', required: true })
  createdBy: Types.ObjectId;
}

export const AssessmentSchema = SchemaFactory.createForClass(Assessment);
