// products/schemas/product.schema.ts - FIXED VERSION
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class SaleRecord {
  @Prop({ required: true })
  orderId: string; // ✅ ԱՎԵԼԱՑՆԵԼ ORDER ID

  @Prop({ required: true })
  orderNumber: string; // ✅ ԱՎԵԼԱՑՆԵԼ ORDER NUMBER

  @Prop({ required: true })
  quantitySold: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  totalAmount: number;

  @Prop({ required: true })
  soldBy: string;

  @Prop({ default: Date.now })
  saleDate: Date;

  @Prop({ required: true })
  customerName: string; // ✅ ԱՎԵԼԱՑՆԵԼ CUSTOMER NAME
}

export type Review = {
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: Date;
};

export type ProductDocument = Product & Document;

@Schema({ timestamps: true })
export class Product {
  @Prop({ required: true, trim: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ 
    required: true, 
    enum: ['men', 'women', 'unisex', 'other'],
    default: 'other'
  })
  category: string;

  @Prop({ required: true, min: 0, default: 0 })
  stock: number;

  @Prop({ default: '/assets/images/placeholder.jpg' })
  image: string;

  @Prop({ type: [String], default: [] })
  images: string[];

  @Prop({ default: 0, min: 0, max: 5 })
  rating: number;

  @Prop({ type: [Object], default: [] })
  reviews: Review[];

  @Prop({ default: 'Unknown Brand' })
  brand: string;

  @Prop({ 
    type: [String], 
    enum: ['30ml', '50ml', '100ml', '128GB', '256GB', '512GB', '1TB', 'Standard', 'Large', 'Small'],
    default: ['Standard']
  })
  sizes: string[];

  @Prop({ 
    enum: ['Eau de Parfum', 'Eau de Toilette', 'Eau de Cologne', 'Perfume Oil', 'N/A'],
    default: 'N/A'
  })
  fragranceType: string;

  @Prop({ min: 0, default: 0 })
  longevity: number;

  @Prop({ default: '' })
  topNotes: string;

  @Prop({ default: '' })
  baseNotes: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: 0 })
  totalSold: number;

  @Prop({ type: [SaleRecord], default: [] })
  saleHistory: SaleRecord[];

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;
}

export const ProductSchema = SchemaFactory.createForClass(Product);