import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum InsightType {
  ACADEMIC_RISK = 'ACADEMIC_RISK',
  ATTENDANCE_RISK = 'ATTENDANCE_RISK',
  FINANCIAL_RISK = 'FINANCIAL_RISK',
  WELFARE_ALERT = 'WELFARE_ALERT',
}

export enum InsightSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export type AIInsightDocument = HydratedDocument<AIInsight>;

@Schema({ collection: 'ai_insights' })
export class AIInsight {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ required: true, enum: InsightType })
  insightType: InsightType;

  @Prop({ required: true, enum: InsightSeverity })
  severity: InsightSeverity;

  @Prop({ required: true, trim: true })
  summary: string;

  @Prop({ type: [String], default: [] })
  recommendations: string[];

  @Prop({ default: Date.now })
  generatedAt: Date;
}

export const AIInsightSchema = SchemaFactory.createForClass(AIInsight);
