import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type LecturerDocument = HydratedDocument<Lecturer>;

@Schema({ collection: 'lecturers', timestamps: true })
export class Lecturer {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ required: true, unique: true, trim: true })
  staffNumber: string;

  @Prop({
    type: Types.ObjectId,
    ref: 'Department',
    required: true,
    index: true,
  })
  departmentId: Types.ObjectId;

  @Prop({ trim: true })
  specialization?: string;

  @Prop()
  employmentDate?: Date;
}

export const LecturerSchema = SchemaFactory.createForClass(Lecturer);
