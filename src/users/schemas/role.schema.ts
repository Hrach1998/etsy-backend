// src/users/schemas/role.schema.ts - Ուղղել toObject warning-ը
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoleDocument = Role & Document;

@Schema({ timestamps: true })
export class Role {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  permissions: string[];
}

export const RoleSchema = SchemaFactory.createForClass(Role);

// ✅ Remove the custom toObject method that causes warning
// RoleSchema.methods.toObject = function() {
//   const obj = this.toObject();
//   obj._id = obj._id.toString();
//   return obj;
// };