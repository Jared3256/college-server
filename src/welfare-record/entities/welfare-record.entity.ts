import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum WelfareRecordStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export type WelfareRecordDocument = HydratedDocument<WelfareRecord>;

@Schema({
  collection: 'welfare_records',
  timestamps: { createdAt: true, updatedAt: false },
})
export class WelfareRecord {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  reportedBy: Types.ObjectId;

  @Prop({ required: true, trim: true })
  issueType: string;

  @Prop({ required: true, trim: true })
  description: string;

  @Prop({ trim: true })
  actionTaken?: string;

  @Prop({
    required: true,
    enum: WelfareRecordStatus,
    default: WelfareRecordStatus.OPEN,
  })
  status: WelfareRecordStatus;
}

export const WelfareRecordSchema = SchemaFactory.createForClass(WelfareRecord);
