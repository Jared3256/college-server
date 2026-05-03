import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum PaymentMethod {
  MPESA = 'MPESA',
  BANK = 'BANK',
  CARD = 'CARD',
  CASH = 'CASH',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

export type PaymentDocument = HydratedDocument<Payment>;

@Schema({
  collection: 'payments',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Payment {
  @Prop({ type: Types.ObjectId, ref: 'Student', required: true, index: true })
  studentId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Parent' })
  parentId?: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  amount: number;

  @Prop({ required: true, default: 'KES', uppercase: true, trim: true })
  currency: string;

  @Prop({ required: true, enum: PaymentMethod })
  paymentMethod: PaymentMethod;

  @Prop({ required: true, unique: true, trim: true, index: true })
  transactionReference: string;

  @Prop({
    required: true,
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    index: true,
  })
  status: PaymentStatus;

  @Prop({ default: Date.now })
  paymentDate: Date;
}

export const PaymentSchema = SchemaFactory.createForClass(Payment);
