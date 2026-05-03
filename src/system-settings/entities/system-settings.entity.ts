import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type SystemSettingsDocument = HydratedDocument<SystemSettings>;

@Schema({
  collection: 'system_settings',
  timestamps: { createdAt: true, updatedAt: false },
})
export class SystemSettings {
  @Prop({ required: true, trim: true })
  institutionName: string;

  @Prop({ trim: true })
  logoUrl?: string;

  @Prop({ required: true, lowercase: true, trim: true })
  supportEmail: string;

  @Prop({ required: true, trim: true })
  academicYear: string;

  @Prop({ required: true, default: 'Africa/Nairobi', trim: true })
  timezone: string;
}

export const SystemSettingsSchema =
  SchemaFactory.createForClass(SystemSettings);
