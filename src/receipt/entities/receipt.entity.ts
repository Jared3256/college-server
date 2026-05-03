import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type ReceiptDocument = HydratedDocument<Receipt>;

@Schema({ collection: 'receipts' })
export class Receipt {
  @Prop({ type: Types.ObjectId, ref: 'Payment', required: true, unique: true })
  paymentId: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  receiptNumber: string;

  @Prop({ required: true, trim: true })
  fileUrl: string;

  @Prop({ default: Date.now })
  issuedAt: Date;
}

export const ReceiptSchema = SchemaFactory.createForClass(Receipt);
