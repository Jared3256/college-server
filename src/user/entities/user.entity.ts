import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export enum UserRole {
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT',
  PARENT = 'PARENT',
  LECTURER = 'LECTURER',
  REGISTRAR = 'REGISTRAR',
  FINANCE = 'FINANCE',
}

export type UserDocument = HydratedDocument<User>;

@Schema({ collection: 'users', timestamps: true })
export class User {
  @Prop({ required: true, trim: true })
  fullName: string;

  @Prop({
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  })
  email: string;

  @Prop({ required: true, trim: true, index: true })
  phoneNumber: string;

  @Prop({ required: true })
  passwordHash: string;

  @Prop({ required: true, enum: UserRole, index: true })
  role: UserRole;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop({ default: false })
  mfaEnabled: boolean;

  @Prop()
  refreshTokenHash?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
