import { Controller, Get, Post, Body } from '@nestjs/common';
import { ProductsService } from '../products/products.service';
import { AuthService } from '../auth/auth.service';

@Controller('admin')
export class AdminController {
  constructor(
    private readonly productsService: ProductsService,
    private readonly authService: AuthService,
  ) {}

  @Get('stats')
  async getStats() {
    return this.authService.getUserStats();
  }

  @Post('products')
  async createProduct(@Body() productData: any) {
    return this.productsService.create(productData);
  }

  @Get('users')
  async getUsers() {
    return this.authService.getUsers();
  }
}