import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export enum RelationshipType {
  FATHER = 'FATHER',
  MOTHER = 'MOTHER',
  GUARDIAN = 'GUARDIAN',
  SPONSOR = 'SPONSOR',
}

export type ParentDocument = HydratedDocument<Parent>;

@Schema({ collection: 'parents', timestamps: true })
export class Parent {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, unique: true })
  userId: Types.ObjectId;

  @Prop({ trim: true })
  occupation?: string;

  @Prop({ required: true, enum: RelationshipType })
  relationshipType: RelationshipType;

  @Prop({ trim: true })
  nationalId?: string;

  @Prop({ trim: true })
  address?: string;

  @Prop({ trim: true })
  emergencyContact?: string;
}

export const ParentSchema = SchemaFactory.createForClass(Parent);
