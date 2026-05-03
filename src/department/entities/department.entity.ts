import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type DepartmentDocument = HydratedDocument<Department>;

@Schema({
  collection: 'departments',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Department {
  @Prop({ required: true, unique: true, trim: true })
  name: string;

  @Prop({ required: true, unique: true, uppercase: true, trim: true })
  code: string;

  @Prop({ trim: true })
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Lecturer' })
  hodId?: Types.ObjectId;
}

export const DepartmentSchema = SchemaFactory.createForClass(Department);
