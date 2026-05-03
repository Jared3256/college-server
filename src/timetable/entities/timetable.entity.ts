import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type TimetableDocument = HydratedDocument<Timetable>;

@Schema({
  collection: 'timetables',
  timestamps: { createdAt: true, updatedAt: false },
})
export class Timetable {
  @Prop({
    type: Types.ObjectId,
    ref: 'CourseUnit',
    required: true,
    index: true,
  })
  courseUnitId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Lecturer', required: true, index: true })
  lecturerId: Types.ObjectId;

  @Prop({ required: true, trim: true })
  room: string;

  @Prop({ required: true, trim: true })
  dayOfWeek: string;

  @Prop({ required: true, trim: true })
  startTime: string;

  @Prop({ required: true, trim: true })
  endTime: string;
}

export const TimetableSchema = SchemaFactory.createForClass(Timetable);
