// src/products/dto/create-sale.dto.ts
import { IsNotEmpty, IsNumber, IsPositive, IsMongoId, Min } from 'class-validator';

export class CreateSaleDto {
  @IsNotEmpty()
  @IsMongoId()
  productId: string;

  @IsNumber()
  @IsPositive()
  @Min(1)
  quantitySold: number;

  @IsNotEmpty()
  soldBy: string; // Admin user ID or name
}