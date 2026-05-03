import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum ParentStudentAccessLevel {
  FULL = 'FULL',
  ACADEMIC_ONLY = 'ACADEMIC_ONLY',
  FINANCE_ONLY = 'FINANCE_ONLY',
  LIMITED = 'LIMITED',
}

export type ParentStudentLinkDocument = HydratedDocument<ParentStudentLink>;

@Schema({
  collection: 'parent_student_links',
  timestamps: { createdAt: true, updatedAt: false },
})
export class ParentStudentLink {
  @Prop({ type: Types.ObjectId, ref: 'Parent', required: true, index: true })
  parentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ParentStudentAccessLevel,
    default: ParentStudentAccessLevel.FULL,
  })
  accessLevel: ParentStudentAccessLevel;

  @Prop({ required: true, min: 0, max: 100, default: 100 })
  billingPercentage: number;

  @Prop({ default: true })
  canViewAcademics: boolean;

  @Prop({ default: true })
  canViewFinance: boolean;

  @Prop({ default: true })
  canReceiveNotifications: boolean;
}

export const ParentStudentLinkSchema =
  SchemaFactory.createForClass(ParentStudentLink);
ParentStudentLinkSchema.index({ parentId: 1, studentId: 1 }, { unique: true });
