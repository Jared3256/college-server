import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type StudentDocumentRecordDocument =
  HydratedDocument<StudentDocumentRecord>;

@Schema({
  collection: 'documents',
  timestamps: { createdAt: true, updatedAt: false },
})
export class StudentDocumentRecord {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  uploadedBy: Types.ObjectId;

  @Prop({ required: true, trim: true })
  fileName: string;

  @Prop({ required: true, trim: true })
  fileUrl: string;

  @Prop({ required: true, trim: true })
  mimeType: string;

  @Prop({ required: true, min: 0 })
  fileSize: number;
}

export const StudentDocumentRecordSchema = SchemaFactory.createForClass(
  StudentDocumentRecord,
);
