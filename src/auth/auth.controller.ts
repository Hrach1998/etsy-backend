// src/auth/auth.controller.ts - ԱՄԲՈՂՋԱԿԱՆ ՈՒՂՂՎԱԾ
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { InjectModel } from '@nestjs/mongoose'; // ✅ Ավելացնել
import { Model } from 'mongoose'; // ✅ Ավելացնել
import { User } from './schemas/user.schema'; // ✅ Ավելացնել
import * as bcrypt from 'bcrypt'; // ✅ Ավելացնել

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    @InjectModel(User.name) private userModel: Model<User>, // ✅ Ավելացնել
  ) {}

  @Post('register')
  register(@Body() registerDto: any) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  login(@Body() loginDto: any) {
    return this.authService.login(loginDto);
  }

  @Get('users')
  async getUsers() {
    return this.authService.getUsers();
  }

  @Get('admin/stats')
  async getAdminStats() {
    const users = await this.authService.getUsers();
    return {
      totalUsers: users.length,
      totalAdmins: users.filter(user => user.role === 'admin').length,
    };
  }

  @Get('stats')
  async getStats() {
    return this.authService.getUserStats();
  }

  // ✅ ԱՎԵԼԱՑՆԵԼ - SEED ENDPOINT
  @Post('seed')
  async seedDatabase() {
    try {
      // Ստուգեք արդեն կա admin
      const existingAdmin = await this.userModel.findOne({ email: 'admin@parfume.fr' });
      
      if (!existingAdmin) {
        // Ստեղծեք admin user
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await this.userModel.create({
          name: 'Administrator',
          email: 'admin@parfume.fr', 
          password: hashedPassword,
          role: 'admin',
          phone: '+37400112233',
          address: 'Yerevan, Armenia',
          isActive: true,
          permissions: ['users:read', 'users:write', 'products:read', 'products:write']
        });
        return { 
          message: '✅ Admin user created successfully', 
          email: 'admin@parfume.fr', 
          password: 'admin123' 
        };
      }
      
      return { message: 'ℹ️ Admin user already exists' };
    } catch (error) {
      return { error: '❌ Seed failed: ' + error.message };
    }
  }
}