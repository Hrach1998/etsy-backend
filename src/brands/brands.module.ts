// src/brands/brands.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BrandsService } from './brands.service';
import { BrandsController } from './brands.controller';
import { Brand, BrandSchema } from './schemas/brand.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Brand.name, schema: BrandSchema }])
  ],
  providers: [BrandsService],
  controllers: [BrandsController],
  exports: [BrandsService]
})
export class BrandsModule {}