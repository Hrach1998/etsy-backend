// src/auth/auth.service.ts - ՎԵՐԱՀԵՂԻՆԱԿՎԱԾ
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { UserService } from '../users/users.service';
import { VerificationService } from './verification.service'; // ✅ Ավելացնել

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private userService: UserService,
    private verificationService: VerificationService, // ✅ Ավելացնել
  ) {}

  // ✅ ՆՈՐ METHOD - Send verification code
  async sendVerificationCode(email: string) {
    try {
      // Ստուգել արդեն գոյություն ունեցող user
      const existingUser = await this.userModel.findOne({ email });
      if (existingUser) {
        return { 
          success: false, 
          error: 'User with this email already exists' 
        };
      }

      await this.verificationService.sendVerificationCode(email);
      return { 
        success: true, 
        message: 'Verification code sent to your email' 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // ✅ ՆՈՐ METHOD - Verify code and register
  async verifyAndRegister(data: { 
    email: string; 
    code: string; 
    password: string; 
    name: string;
    role?: string;
  }) {
    try {
      // Verify the code
      const isValid = await this.verificationService.verifyCode(data.email, data.code);
      
      if (!isValid) {
        return { success: false, error: 'Invalid or expired verification code' };
      }

      // Use existing register method to create user
      const { token, user } = await this.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role || 'user'
      });

      return { 
        success: true, 
        message: 'Email verified and user registered successfully',
        token,
        user 
      };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // ✅ Ձեր գոյություն ունեցող register method-ը (մնում է նույնը)
  async register(registerDto: any): Promise<{ token: string; user: any }> {
    const { name, email, password, role = 'user' } = registerDto;

    // Basic validation
    if (!name || !email || !password) {
      throw new UnauthorizedException('All fields are required');
    }

    if (password.length < 6) {
      throw new UnauthorizedException('Password must be at least 6 characters');
    }

    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new UnauthorizedException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.userModel.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    // ✅ Type-safe _id օգտագործում
    const userId = (user._id as any).toString();
    const permissions = await this.userService.getUserPermissions(userId);

    const token = this.jwtService.sign({ 
      sub: userId,
      email: user.email,
      role: user.role,
      permissions: permissions
    });

    console.log('🎫 JWT Token created with payload:', { 
      sub: userId, 
      email: user.email,
      role: user.role 
    });

    // Return user without password
    const userResponse = {
      id: userId,
      _id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: permissions
    };

    return { token, user: userResponse };
  }

  // ✅ Ձեր գոյություն ունեցող login method-ը (մնում է նույնը)
  async login(loginDto: any): Promise<{ token: string; user: any }> {
    const { email, password } = loginDto;

    if (!email || !password) {
      throw new UnauthorizedException('Email and password are required');
    }

    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const userId = (user._id as any).toString();
    const permissions = await this.userService.getUserPermissions(userId);

    const token = this.jwtService.sign({ 
      sub: userId,
      email: user.email,
      role: user.role,
      permissions: permissions
    });

    console.log('🎫 JWT Token created with payload:', { 
      sub: userId, 
      email: user.email,
      role: user.role 
    });

    const userResponse = {
      id: userId,
      _id: userId,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: permissions,
      createdAt: user.createdAt
    };

    return { token, user: userResponse };
  }

  // ✅ Մնացած method-ները մնում են նույնը
  async getUsers(): Promise<any[]> {
    const users = await this.userModel.find().select('-password');
    return users;
  }

  async getUserStats(): Promise<any> {
    const users = await this.userModel.find();
    const totalUsers = users.length;
    const adminUsers = users.filter(user => user.role === 'admin').length;
    const regularUsers = users.filter(user => user.role === 'user').length;
    
    const last7Days: { date: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const startOfDay = new Date(date.setHours(0, 0, 0, 0));
      const endOfDay = new Date(date.setHours(23, 59, 59, 999));
      
      const usersThisDay = await this.userModel.countDocuments({
        createdAt: { $gte: startOfDay, $lte: endOfDay }
      });
      
      last7Days.push({
        date: date.toDateString(),
        count: usersThisDay
      });
    }

    return {
      totalUsers,
      adminUsers,
      regularUsers,
      registrationStats: last7Days
    };
  }
}