// src/auth/auth.controller.ts - ՎԵՐԱՀԵՂԻՆԱԿՈՒՄ
import { Controller, Post, Body, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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

  // ✅ ԱՎԵԼԱՑՆԵԼ - getUserStats() method-ի կանչը
  @Get('stats')
  async getStats() {
    return this.authService.getUserStats();
  }
}