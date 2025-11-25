// products.controller.ts - FIX BRAND FILTER IN ENDPOINT
import { 
    Controller, 
    Get, 
    Post, 
    Put, 
    Delete, 
    Param, 
    Body, 
    NotFoundException, 
    BadRequestException,
    Query, 
    ValidationPipe,
    UsePipes
  } from '@nestjs/common';
  import { ProductsService } from './products.service';
  import { Product } from './schemas/product.schema';
  import { CreateReviewDto } from './dto/create-review.dto';
  import { CreateSaleDto } from './dto/create-sale.dto';
  
  @Controller('products')
  export class ProductsController {
    constructor(private readonly productsService: ProductsService) {}
  
    // ✅ Բոլոր ապրանքները (առանց ֆիլտրի)
    @Get()
    async findAll(): Promise<Product[]> {
      return this.productsService.findAll();
    }
  
    // ✅ Ապրանքները ֆիլտրով (կատեգորիա, որոնում, և BRAND) - FIXED
    @Get('filter')
    async findWithFilters(
      @Query('category') category?: string,
      @Query('search') search?: string,
      @Query('brand') brand?: string // ✅ ԱՎԵԼԱՑՆԵԼ BRAND ՊԱՐԱՄԵՏՐԸ
    ): Promise<Product[]> {
      console.log('🟡 Backend filtering products with:', { category, search, brand });
      
      const products = await this.productsService.findWithFilters(category, search, brand);
      console.log(`🟢 Found ${products.length} products with backend filtering`);
      
      return products;
    }
  
    // ✅ Մնացած մեթոդները մնում են նույնը...
    @Get('categories')
    async getCategories(): Promise<string[]> {
      console.log('🟡 Fetching all categories');
      const categories = await this.productsService.getCategories();
      console.log('🟢 Categories found:', categories);
      return categories;
    }
  
    @Get('perfumes')
    async findPerfumes(): Promise<Product[]> {
      console.log('🟡 Fetching all perfume products');
      const perfumes = await this.productsService.findPerfumes();
      console.log(`🟢 Found ${perfumes.length} perfume products`);
      return perfumes;
    }
  
    @Get('brand/:brand')
    async findByBrand(@Param('brand') brand: string): Promise<Product[]> {
      console.log('🟡 Fetching products by brand:', brand);
      if (!brand || brand.trim() === '') {
        throw new BadRequestException('Brand parameter is required');
      }
      
      const products = await this.productsService.findByBrand(brand);
      console.log(`🟢 Found ${products.length} products for brand: ${brand}`);
      return products;
    }
  
    // ✅ Նոր search endpoint որ օգտագործում է backend ֆիլտր
    @Get('search')
    async searchProducts(@Query('q') query: string): Promise<Product[]> {
      console.log('🟡 Searching products with query:', query);
      
      if (!query || query.trim() === '') {
        throw new BadRequestException('Search query is required');
      }
  
      // Օգտագործել backend ֆիլտր մեթոդը
      const products = await this.productsService.findWithFilters(undefined, query);
      console.log(`🟢 Found ${products.length} products matching: ${query}`);
      return products;
    }
  
    @Get(':id')
    async findOne(@Param('id') id: string): Promise<Product> {
      console.log('🟡 Fetching product with ID:', id);
      const product = await this.productsService.findOne(id);
      if (!product) {
        console.log('🔴 Product not found with ID:', id);
        throw new NotFoundException('Product not found');
      }
      console.log('🟢 Product found:', product.name);
      return product;
    }
  
    @Get('category/:category')
    async findByCategory(@Param('category') category: string): Promise<Product[]> {
      console.log('🟡 Fetching products by category:', category);
      
      const validCategories = ['men', 'women', 'unisex'];
      if (!validCategories.includes(category.toLowerCase())) {
        throw new BadRequestException(`Invalid category. Must be one of: ${validCategories.join(', ')}`);
      }
  
      // Օգտագործել backend ֆիլտր մեթոդը
      const products = await this.productsService.findWithFilters(category);
      console.log(`🟢 Found ${products.length} products in category: ${category}`);
      return products;
    }
  
    @Post()
    async create(@Body() product: Partial<Product>): Promise<Product> {
      console.log('🟡 Creating new product:', product.name);
      
      // Enhanced validation for perfume products
      if (!product.name || !product.description || !product.price || !product.category) {
        throw new BadRequestException('Missing required fields: name, description, price, category');
      }
  
      // Additional validation for perfume-specific fields
      if (['men', 'women', 'unisex'].includes(product.category)) {
        if (!product.brand) {
          throw new BadRequestException('Brand is required for perfume products');
        }
        if (!product.sizes || product.sizes.length === 0) {
          throw new BadRequestException('At least one size must be selected for perfume products');
        }
      }
  
      const newProduct = await this.productsService.create(product);
      console.log('🟢 Product created successfully:', newProduct.name);
      return newProduct;
    }
  
    @Post('sample')
    async createSampleData(): Promise<{ message: string }> {
      console.log('🟡 Creating sample data...');
      await this.productsService.createSampleData();
      console.log('🟢 Sample data created successfully');
      return { message: 'Sample products created successfully!' };
    }
  
    // ✅ Enhanced Review Endpoint
    @Post(':id/reviews')
    async addReview(
      @Param('id') id: string,
      @Body() createReviewDto: CreateReviewDto,
    ): Promise<Product> {
      console.log('🎯 ========== REVIEW ENDPOINT CALLED ==========');
      console.log('📦 Product ID:', id);
      console.log('📝 Review DTO received:', JSON.stringify(createReviewDto, null, 2));
      
      // ✅ SIMPLER VALIDATION - Direct checks without array
      if (!createReviewDto.userId) {
        throw new BadRequestException('Missing required field: userId');
      }
      if (!createReviewDto.userName) {
        throw new BadRequestException('Missing required field: userName');
      }
      if (!createReviewDto.comment || createReviewDto.comment.trim() === '') {
        throw new BadRequestException('Missing required field: comment');
      }
      if (!createReviewDto.rating) {
        throw new BadRequestException('Missing required field: rating');
      }
      if (createReviewDto.rating < 1 || createReviewDto.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }
  
      console.log('✅ All validation passed');
  
      const product = await this.productsService.addReview(id, createReviewDto);
      if (!product) {
        console.log('❌ Product not found with ID:', id);
        throw new NotFoundException('Product not found');
      }
  
      console.log('✅ Review added successfully to product:', product.name);
      console.log('🎯 ========== REVIEW ENDPOINT COMPLETED ==========');
      
      return product;
    }
  
    @Put(':id')
    async update(@Param('id') id: string, @Body() product: Partial<Product>): Promise<Product> {
      console.log('🟡 Updating product with ID:', id);
      
      if (!id) {
        throw new BadRequestException('Product ID is required');
      }
  
      const updatedProduct = await this.productsService.update(id, product);
      if (!updatedProduct) {
        console.log('🔴 Product not found with ID:', id);
        throw new NotFoundException('Product not found');
      }
  
      console.log('🟢 Product updated successfully:', updatedProduct.name);
      return updatedProduct;
    }
  
    @Put(':id/status')
    async updateStatus(
      @Param('id') id: string, 
      @Body() body: { isActive: boolean }
    ): Promise<Product> {
      console.log('🟡 Updating product status:', { id, isActive: body.isActive });
      
      if (!id) {
        throw new BadRequestException('Product ID is required');
      }
      if (typeof body.isActive !== 'boolean') {
        throw new BadRequestException('isActive must be a boolean');
      }
  
      const updatedProduct = await this.productsService.updateStatus(id, body.isActive);
      if (!updatedProduct) {
        console.log('🔴 Product not found with ID:', id);
        throw new NotFoundException('Product not found');
      }
  
      console.log('🟢 Product status updated:', { 
        name: updatedProduct.name, 
        isActive: updatedProduct.isActive 
      });
      return updatedProduct;
    }
  
    @Delete(':id')
    async delete(@Param('id') id: string): Promise<{ message: string }> {
      console.log('🟡 Deleting product with ID:', id);
      
      if (!id) {
        throw new BadRequestException('Product ID is required');
      }
  
      // Check if product exists before deleting
      const product = await this.productsService.findOne(id);
      if (!product) {
        console.log('🔴 Product not found with ID:', id);
        throw new NotFoundException('Product not found');
      }
  
      await this.productsService.delete(id);
      console.log('🟢 Product deleted successfully:', product.name);
      
      return { message: 'Product deleted successfully' };
    }
  
    // ✅ New endpoint to get product statistics
    @Get('stats/overview')
    async getProductStats(): Promise<any> {
      console.log('🟡 Fetching product statistics');
      
      const allProducts = await this.productsService.findAll();
      const perfumes = await this.productsService.findPerfumes();
      
      const stats = {
        totalProducts: allProducts.length,
        totalPerfumes: perfumes.length,
        categories: {
          men: allProducts.filter(p => p.category === 'men').length,
          women: allProducts.filter(p => p.category === 'women').length,
          unisex: allProducts.filter(p => p.category === 'unisex').length,
        },
        brands: Array.from(new Set(allProducts.map(p => p.brand))).length,
        lastUpdated: new Date().toISOString()
      };
  
      console.log('🟢 Product statistics generated');
      return stats;
    }
  
    @Get('brands/list')
    async getBrands(): Promise<string[]> {
      console.log('🟡 Fetching all brands');
      const brands = await this.productsService.getBrands();
      console.log('🟢 Brands found:', brands);
      return brands;
    }

    @Post('sale')
    @UsePipes(new ValidationPipe())
    async startSale(@Body() createSaleDto: CreateSaleDto): Promise<Product> {
      return this.productsService.startSale(createSaleDto);
    }
    
    @Get('sales/history')
    async getAllSales(): Promise<any[]> {
      return this.productsService.getAllSales();
    }
    
    @Get('sales/stats')
    async getSalesStats(): Promise<any> {
      return this.productsService.getSalesStats();
    }
    
    @Get(':id/sales')
    async getProductSales(@Param('id') id: string): Promise<any[]> {
      return this.productsService.getProductSales(id);
    }
    
    @Delete(':productId/sales/:saleIndex')
    async deleteSale(
      @Param('productId') productId: string,
      @Param('saleIndex') saleIndex: string
    ): Promise<Product> {
      const numericSaleIndex = parseInt(saleIndex, 10);
      if (isNaN(numericSaleIndex) || numericSaleIndex < 0) {
        throw new BadRequestException('Invalid sale index');
      }
      return this.productsService.deleteSale(productId, numericSaleIndex);
    }
    
    @Get('sales/quick-stats')
    async getQuickSalesStats(): Promise<any> {
      const stats = await this.productsService.getSalesStats();
      const allProducts = await this.productsService.findAll();
      const totalProducts = allProducts.length;
      const lowStockProducts = allProducts.filter(p => p.stock < 10).length;
      
      return {
        ...stats,
        totalProducts,
        lowStockProducts,
        lowStockPercentage: Math.round((lowStockProducts / totalProducts) * 100)
      };
    }
  }