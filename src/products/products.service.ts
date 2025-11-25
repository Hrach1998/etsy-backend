// src/products/products.service.ts - COMPLETE FIXED VERSION
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product, ProductDocument, Review, SaleRecord } from './schemas/product.schema';
import { CreateReviewDto } from './dto/create-review.dto';
import { CreateSaleDto } from './dto/create-sale.dto';

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  // ✅ Բոլոր ապրանքները (առանց ֆիլտրի)
  async findAll(): Promise<Product[]> {
    return await this.productModel.find({ isActive: true }).exec();
  }

  // ✅ Ապրանքները ֆիլտրով (կատեգորիա, որոնում, և brand)
  async findWithFilters(category?: string, search?: string, brand?: string): Promise<Product[]> {
    console.log('🟡 Filtering products with:', { category, search, brand });
    
    let filter: any = { isActive: true };

    // Կատեգորիայի ֆիլտր
    if (category && category !== '') {
      filter.category = category;
    }

    // Brand ֆիլտր
    if (brand && brand !== '') {
      filter.brand = brand;
    }

    // Որոնման ֆիլտր
    if (search && search !== '') {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('🟡 Final filter:', filter);
    
    const products = await this.productModel.find(filter).exec();
    console.log(`🟡 Found ${products.length} products`);
    
    return products;
  }

  async findOne(id: string): Promise<Product | null> {
    return await this.productModel.findById(id).exec();
  }

  async create(product: Partial<Product>): Promise<Product> {
    // ✅ Ensure required fields have defaults including images array
    const productData = {
      brand: product.brand || 'Unknown Brand',
      sizes: Array.isArray(product.sizes) ? product.sizes : ['Standard'],
      fragranceType: product.fragranceType || 'N/A',
      longevity: product.longevity || 0,
      topNotes: product.topNotes || '',
      baseNotes: product.baseNotes || '',
      images: Array.isArray(product.images) ? product.images : [], // ✅ Handle images
      isActive: product.isActive !== false,
      rating: 0,
      reviews: [],
      ...product
    };
  
    // ✅ Ensure main image is included in images array
    if (productData.image && !productData.images.includes(productData.image)) {
      productData.images.unshift(productData.image);
    }
  
    const newProduct = new this.productModel(productData);
    return await newProduct.save();
  }

  async update(id: string, product: Partial<Product>): Promise<Product | null> {
    return await this.productModel.findByIdAndUpdate(id, product, { new: true }).exec();
  }

  async delete(id: string): Promise<void> {
    await this.productModel.findByIdAndDelete(id).exec();
  }

  async updateStatus(id: string, isActive: boolean): Promise<Product | null> {
    return await this.productModel.findByIdAndUpdate(
      id, 
      { isActive }, 
      { new: true }
    ).exec();
  }

  async findByCategory(category: string): Promise<Product[]> {
    return await this.productModel.find({ 
      category, 
      isActive: true 
    }).exec();
  }

  // ✅ Enhanced Review Method with all new fields
  async addReview(id: string, createReviewDto: CreateReviewDto): Promise<Product | null> {
    console.log('🟡 ========== ADD REVIEW SERVICE CALLED ==========');
    console.log('🟡 Product ID:', id);
    console.log('🟡 Review DTO:', createReviewDto);
    
    try {
      const product = await this.productModel.findById(id);
      console.log('🟡 Product found:', product ? 'YES' : 'NO');
      
      if (!product) {
        console.log('🔴 Product not found with ID:', id);
        return null;
      }

      console.log('🟡 Product name:', product.name);
      console.log('🟡 Current reviews:', product.reviews?.length || 0);

      // Create new review object
      const newReview: Review = {
        userId: createReviewDto.userId,
        userName: createReviewDto.userName,
        rating: createReviewDto.rating,
        comment: createReviewDto.comment,
        createdAt: new Date(),
      };

      console.log('🟡 New review object:', newReview);

      // Initialize reviews array if it doesn't exist
      if (!product.reviews) {
        product.reviews = [];
        console.log('🟡 Initialized empty reviews array');
      }

      // Add the new review
      product.reviews.push(newReview);
      console.log('🟡 Reviews after push:', product.reviews.length);

      // Calculate average rating
      const totalRating = product.reviews.reduce((sum, review) => sum + review.rating, 0);
      product.rating = totalRating / product.reviews.length;

      console.log('🟡 Updated rating:', product.rating);
      console.log('🟡 Total reviews now:', product.reviews.length);

      const savedProduct = await product.save();
      console.log('🟢 Review saved successfully');
      console.log('🟡 Saved product reviews:', savedProduct.reviews?.length);
      console.log('🟢 ========== ADD REVIEW COMPLETED ==========');
      
      return savedProduct;
    } catch (error) {
      console.error('🔴 Error in addReview service:', error);
      console.error('🔴 Error message:', error.message);
      console.error('🔴 Error stack:', error.stack);
      throw error;
    }
  }

  // ✅ Enhanced Sample Data with Perfume Products - FIXED VERSION
  async createSampleData(): Promise<void> {
    console.log('🟡 Starting sample data creation...');
    
    const sampleProducts = [
      {
        name: "CHOGAN OLFAZETA LUXURY PARFÜM- ASTRAL24 - 50 ml",
        description: "Olfazeta 137 Women/Men Perfume 50ml - Extrait de Parfum (30% Essence) | Bergamot & Lemon, Lavender | Heart: Honey, Cinnamon, Jasmine Sambac, Cashmeran | Base: Vanilla, Tonka Bean, Tobacco Blossom",
        price: 41.25,
        category: "men",
        stock: 50,
        image: "https://m.media-amazon.com/images/I/41s+DSY5lRL._SL1080_.jpg",
        brand: "CHOGAN",
        sizes: ["50ml", "100ml"],
        fragranceType: "Eau de Parfum",
        longevity: 12,
        topNotes: "Bergamot, Lemon, Lavender",
        baseNotes: "Vanilla, Tonka Bean, Tobacco Blossom",
        rating: 4.5,
        reviews: [
          {
            userId: '65a1b2c3d4e5f67890123456',
            userName: 'Anna Smith',
            rating: 5,
            comment: 'Amazing scent! Lasts all day.',
            createdAt: new Date('2024-01-15')
          }
        ]
      },
      {
        name: "Chanel Coco Mademoiselle",
        description: "A modern oriental fragrance with fresh notes for the confident woman",
        price: 125.00,
        category: "women",
        stock: 30,
        image: "https://example.com/chanel-coco.jpg",
        brand: "Chanel",
        sizes: ["30ml", "50ml", "100ml"],
        fragranceType: "Eau de Parfum",
        longevity: 10,
        topNotes: "Orange, Bergamot, Grapefruit",
        baseNotes: "Patchouli, Vetiver, White Musk",
        rating: 4.8
      },
      {
        name: "Dior Sauvage",
        description: "A radically fresh fragrance for men with explosive freshness",
        price: 95.00,
        category: "men",
        stock: 40,
        image: "https://example.com/dior-sauvage.jpg",
        brand: "Dior",
        sizes: ["50ml", "100ml"],
        fragranceType: "Eau de Toilette",
        longevity: 8,
        topNotes: "Calabrian Bergamot",
        baseNotes: "Ambroxan, Cedar",
        rating: 4.7
      },
      {
        name: "Jo Malone Wood Sage & Sea Salt",
        description: "Unisex fragrance with woody and salty notes",
        price: 85.00,
        category: "unisex",
        stock: 25,
        image: "https://example.com/jo-malone.jpg",
        brand: "Jo Malone",
        sizes: ["30ml", "100ml"],
        fragranceType: "Cologne",
        longevity: 6,
        topNotes: "Ambrette Seeds, Sea Salt",
        baseNotes: "Sage, Woody Notes",
        rating: 4.6
      },
      {
        name: "Gucci Bloom",
        description: "A rich and captivating floral fragrance",
        price: 110.00,
        category: "women",
        stock: 35,
        image: "https://example.com/gucci-bloom.jpg",
        brand: "Gucci",
        sizes: ["50ml", "100ml"],
        fragranceType: "Eau de Parfum",
        longevity: 9,
        topNotes: "Jasmine, Tuberose",
        baseNotes: "Orris Root, Musk",
        rating: 4.4
      },
      {
        name: "Versace Eros",
        description: "A bold, passionate fragrance for men",
        price: 75.00,
        category: "men",
        stock: 45,
        image: "https://example.com/versace-eros.jpg",
        brand: "Versace",
        sizes: ["50ml", "100ml"],
        fragranceType: "Eau de Toilette",
        longevity: 7,
        topNotes: "Mint, Green Apple",
        baseNotes: "Vanilla, Vetiver",
        rating: 4.3
      }
    ];

    try {
      console.log('🟡 Clearing existing products...');
      await this.productModel.deleteMany({});
      console.log('🟡 Existing products cleared');

      console.log('🟡 Inserting sample products...');
      const result = await this.productModel.insertMany(sampleProducts);
      console.log(`🟢 Sample data created successfully! Inserted ${result.length} products`);
      
    } catch (error) {
      console.error('🔴 Error creating sample data:', error);
      console.error('🔴 Error details:', error.message);
      throw error;
    }
  }

  // ✅ New method to get products by brand
  async findByBrand(brand: string): Promise<Product[]> {
    return await this.productModel.find({ 
      brand: new RegExp(brand, 'i'),
      isActive: true 
    }).exec();
  }

  // ✅ New method to get perfume products only
  async findPerfumes(): Promise<Product[]> {
    return await this.productModel.find({
      category: { $in: ['men', 'women', 'unisex'] },
      isActive: true
    }).exec();
  }

  // ✅ Ստանալ բոլոր կատեգորիաները
  async getCategories(): Promise<string[]> {
    const categories = await this.productModel.distinct('category', { isActive: true }).exec();
    return categories.filter(cat => cat && cat !== '');
  }

  // ✅ Ստանալ բոլոր brand-երը
  async getBrands(): Promise<string[]> {
    const brands = await this.productModel.distinct('brand', { isActive: true }).exec();
    return brands.filter(brand => brand && brand !== '').sort();
  }

  // ✅ Ստանալ բոլոր չափսերը
  async getSizes(): Promise<string[]> {
    const sizes = await this.productModel.distinct('sizes', { isActive: true }).exec();
    // Flatten the array since sizes is an array of arrays
    const flatSizes = sizes.flat();
    return [...new Set(flatSizes)].filter(size => size && size !== '').sort();
  }

  // ✅ FIXED: startSale մեթոդը բոլոր պարտադիր դաշտերով
  async startSale(createSaleDto: CreateSaleDto): Promise<Product> {
    const { productId, quantitySold, soldBy } = createSaleDto;

    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantitySold) {
      throw new BadRequestException(`Not enough stock. Available: ${product.stock}`);
    }

    // ✅ COMPLETE SaleRecord բոլոր պարտադիր դաշտերով
    const saleRecord: SaleRecord = {
      orderId: `manual-${Date.now()}`,
      orderNumber: `MANUAL-${Date.now()}`,
      customerName: 'Manual Sale',
      quantitySold,
      unitPrice: product.price,
      totalAmount: product.price * quantitySold,
      soldBy,
      saleDate: new Date(),
    };

    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      {
        $inc: { 
          stock: -quantitySold,
          totalSold: quantitySold 
        },
        $push: { saleHistory: saleRecord }
      },
      { new: true }
    );

    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }

    return updatedProduct;
  }

  // ✅ Ստանալ բոլոր վաճառքները
  async getAllSales(): Promise<any[]> {
    const products = await this.productModel.find({ 
      'saleHistory.0': { $exists: true }
    }).exec();

    const allSales: any[] = [];
    products.forEach(product => {
      if (product.saleHistory && product.saleHistory.length > 0) {
        product.saleHistory.forEach(sale => {
          allSales.push({
            orderId: sale.orderId,
            orderNumber: sale.orderNumber,
            customerName: sale.customerName,
            quantitySold: sale.quantitySold,
            unitPrice: sale.unitPrice,
            totalAmount: sale.totalAmount,
            soldBy: sale.soldBy,
            saleDate: sale.saleDate,
            productName: product.name,
            productBrand: product.brand,
            productId: (product as any)._id?.toString()
          });
        });
      }
    });

    return allSales.sort((a, b) => 
      new Date(b.saleDate).getTime() - new Date(a.saleDate).getTime()
    );
  }

  // ✅ Վաճառքների վիճակագրություն
  async getSalesStats() {
    const products = await this.productModel.find({ 
      'saleHistory.0': { $exists: true }
    }).exec();

    let totalSales = 0;
    let totalRevenue = 0;
    let totalItemsSold = 0;

    products.forEach(product => {
      if (product.saleHistory) {
        product.saleHistory.forEach(sale => {
          totalSales++;
          totalRevenue += sale.totalAmount;
          totalItemsSold += sale.quantitySold;
        });
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const todaySales = products.reduce((count, product) => {
      if (product.saleHistory) {
        return count + product.saleHistory.filter(sale => 
          new Date(sale.saleDate) >= today
        ).length;
      }
      return count;
    }, 0);

    return {
      totalSales,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalItemsSold,
      todaySales,
      averageSaleValue: totalSales > 0 ? Math.round((totalRevenue / totalSales) * 100) / 100 : 0
    };
  }

  // ✅ Ջնջել վաճառք
  async deleteSale(productId: string, saleIndex: number): Promise<Product> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    if (!product.saleHistory || saleIndex >= product.saleHistory.length) {
      throw new NotFoundException('Sale record not found');
    }

    const saleToDelete = product.saleHistory[saleIndex];
    
    const updatedProduct = await this.productModel.findByIdAndUpdate(
      productId,
      {
        $inc: { 
          stock: saleToDelete.quantitySold,
          totalSold: -saleToDelete.quantitySold 
        },
        $pull: { 
          saleHistory: { 
            saleDate: saleToDelete.saleDate,
            quantitySold: saleToDelete.quantitySold
          }
        }
      },
      { new: true }
    );

    if (!updatedProduct) {
      throw new NotFoundException('Product not found after update');
    }

    return updatedProduct;
  }

  // ✅ Ստանալ կոնկրետ ապրանքի վաճառքները
  async getProductSales(productId: string): Promise<any[]> {
    const product = await this.productModel.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product.saleHistory || [];
  }
}