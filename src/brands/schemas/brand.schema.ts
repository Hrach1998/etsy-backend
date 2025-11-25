// src/brands/schemas/brand.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type BrandDocument = Brand & Document;

@Schema({ timestamps: true })
export class Brand {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop()
  description: string;

  @Prop()
  logo: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  productCount: number;
}

export const BrandSchema = SchemaFactory.createForClass(Brand);