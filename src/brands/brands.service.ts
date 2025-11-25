// src/brands/brands.service.ts
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Brand, BrandDocument } from './schemas/brand.schema';

@Injectable()
export class BrandsService {
  constructor(
    @InjectModel(Brand.name) private brandModel: Model<BrandDocument>,
  ) {}

  async findAll(): Promise<Brand[]> {
    return await this.brandModel.find({ isActive: true }).sort({ name: 1 }).exec();
  }

  async findAllWithInactive(): Promise<Brand[]> {
    return await this.brandModel.find().sort({ name: 1 }).exec();
  }

  async findById(id: string): Promise<Brand | null> {
    return await this.brandModel.findById(id).exec();
  }

  async findByName(name: string): Promise<Brand | null> {
    return await this.brandModel.findOne({ name: new RegExp(name, 'i') }).exec();
  }

  async create(brand: Partial<Brand>): Promise<Brand> {
    const newBrand = new this.brandModel(brand);
    return await newBrand.save();
  }

  async update(id: string, brand: Partial<Brand>): Promise<Brand | null> {
    return await this.brandModel.findByIdAndUpdate(id, brand, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.brandModel.findByIdAndDelete(id).exec();
  }

  async updateProductCount(brandName: string): Promise<void> {
    const count = await this.brandModel.aggregate([
      { $match: { name: brandName } },
      { $lookup: {
          from: 'products',
          localField: 'name',
          foreignField: 'brand',
          as: 'products'
        }
      },
      { $project: {
          productCount: { $size: '$products' }
        }
      }
    ]).exec();

    if (count.length > 0) {
      await this.brandModel.updateOne(
        { name: brandName },
        { productCount: count[0].productCount }
      ).exec();
    }
  }

  // ✅ Create sample brands
  async createSampleBrands(): Promise<void> {
    const sampleBrands = [
      {
        name: 'Chanel',
        description: 'French luxury fashion house founded by Coco Chanel',
        logo: 'https://example.com/chanel-logo.jpg'
      },
      {
        name: 'Dior',
        description: 'French luxury goods company controlled by Bernard Arnault',
        logo: 'https://example.com/dior-logo.jpg'
      },
      {
        name: 'Gucci',
        description: 'Italian luxury brand of fashion and leather goods',
        logo: 'https://example.com/gucci-logo.jpg'
      },
      {
        name: 'Versace',
        description: 'Italian luxury fashion company founded by Gianni Versace',
        logo: 'https://example.com/versace-logo.jpg'
      },
      {
        name: 'Prada',
        description: 'Italian luxury fashion house founded by Mario Prada',
        logo: 'https://example.com/prada-logo.jpg'
      },
      {
        name: 'Hermès',
        description: 'French luxury goods manufacturer established in 1837',
        logo: 'https://example.com/hermes-logo.jpg'
      },
      {
        name: 'Tom Ford',
        description: 'American luxury fashion house founded by Tom Ford',
        logo: 'https://example.com/tomford-logo.jpg'
      },
      {
        name: 'Yves Saint Laurent',
        description: 'French luxury fashion house founded by Yves Saint Laurent',
        logo: 'https://example.com/ysl-logo.jpg'
      },
      {
        name: 'Bvlgari',
        description: 'Italian luxury brand known for jewelry, watches, and fragrances',
        logo: 'https://example.com/bvlgari-logo.jpg'
      },
      {
        name: 'Creed',
        description: 'British niche perfume house founded in 1760',
        logo: 'https://example.com/creed-logo.jpg'
      }
    ];

    try {
      await this.brandModel.deleteMany({});
      await this.brandModel.insertMany(sampleBrands);
      console.log('🟢 Sample brands created successfully');
    } catch (error) {
      console.error('🔴 Error creating sample brands:', error);
      throw error;
    }
  }
}