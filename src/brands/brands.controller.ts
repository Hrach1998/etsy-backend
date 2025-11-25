// src/brands/brands.controller.ts
import { Controller, Get, Post, Put, Delete, Param, Body, BadRequestException, NotFoundException } from '@nestjs/common';
import { BrandsService } from './brands.service';
import { Brand } from './schemas/brand.schema';

@Controller('brands')
export class BrandsController {
  constructor(private readonly brandsService: BrandsService) {}

  @Get()
  async findAll(): Promise<Brand[]> {
    return this.brandsService.findAll();
  }

  @Get('all')
  async findAllWithInactive(): Promise<Brand[]> {
    return this.brandsService.findAllWithInactive();
  }

  @Get(':id')
  async findById(@Param('id') id: string): Promise<Brand> {
    const brand = await this.brandsService.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }
    return brand;
  }

  @Post()
  async create(@Body() brand: Partial<Brand>): Promise<Brand> {
    if (!brand.name) {
      throw new BadRequestException('Brand name is required');
    }

    // Check if brand already exists
    const existingBrand = await this.brandsService.findByName(brand.name);
    if (existingBrand) {
      throw new BadRequestException('Brand already exists');
    }

    return this.brandsService.create(brand);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() brand: Partial<Brand>): Promise<Brand> {
    const updatedBrand = await this.brandsService.update(id, brand);
    if (!updatedBrand) {
      throw new NotFoundException('Brand not found');
    }
    return updatedBrand;
  }

  @Delete(':id')
  async delete(@Param('id') id: string): Promise<{ message: string }> {
    const brand = await this.brandsService.findById(id);
    if (!brand) {
      throw new NotFoundException('Brand not found');
    }

    await this.brandsService.delete(id);
    return { message: 'Brand deleted successfully' };
  }

  @Post('sample')
  async createSampleBrands(): Promise<{ message: string }> {
    await this.brandsService.createSampleBrands();
    return { message: 'Sample brands created successfully' };
  }
}