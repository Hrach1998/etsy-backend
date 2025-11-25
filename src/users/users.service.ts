// src/users/users.service.ts - ՊԱՐԶ ՈՒՂՂՎԱԾ ՎԵՐՍԻԱ
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Role, RoleDocument } from './schemas/role.schema';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(Role.name) private roleModel: Model<RoleDocument>,
  ) {}

  // ✅ User profile methods with SIMPLE logging
  async getUserProfile(userId: string): Promise<UserDocument> {
    console.log('🔍 getUserProfile called for userId:', userId);
    const user = await this.userModel.findById(userId).select('-password');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // ✅ ՊԱՐԶ LOGGING - ԱՆՑԱՆԸ updatedAt-ԻՑ
    console.log('📋 User data from database:');
    console.log('  - ID:', user._id);
    console.log('  - Name:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Phone:', user.phone);     // ✅ ՍՏՈՒԳԵԼ phone
    console.log('  - Address:', user.address); // ✅ ՍՏՈՒԳԵԼ address
    console.log('  - isActive:', user.isActive);
    
    // ✅ ՍՏՈՒԳԵԼ phone ԵՎ address ԴԱՇՏԵՐԸ
    console.log('📞 Phone field exists:', 'phone' in user);
    console.log('📞 Phone value:', user.phone);
    console.log('📞 Phone type:', typeof user.phone);
    console.log('🏠 Address field exists:', 'address' in user);
    console.log('🏠 Address value:', user.address);
    console.log('🏠 Address type:', typeof user.address);
    
    return user;
  }

  async updateUserProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserDocument> {
    console.log('✏️ updateUserProfile called for userId:', userId);
    console.log('📝 Update data received:', updateUserDto);
    
    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { $set: updateUserDto },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    // ✅ ՊԱՐԶ LOGGING - ԱՆՑԱՆԸ updatedAt-ԻՑ
    console.log('✅ User after update:');
    console.log('  - ID:', user._id);
    console.log('  - Name:', user.name);
    console.log('  - Email:', user.email);
    console.log('  - Role:', user.role);
    console.log('  - Phone:', user.phone);     // ✅ ՍՏՈՒԳԵԼ phone
    console.log('  - Address:', user.address); // ✅ ՍՏՈՒԳԵԼ address
    console.log('  - isActive:', user.isActive);
    
    console.log('📞 Phone after update:', user.phone);
    console.log('🏠 Address after update:', user.address);
    
    return user;
  }

  // ... keep all other methods the same as before
  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id);
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ email });
  }

  async createUser(email: string, password: string, name: string = 'User'): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = new this.userModel({
      name,
      email,
      password: hashedPassword,
      role: 'customer'
    });

    return user.save();
  }

  async assignRole(userId: string, roleName: string): Promise<any> {
    console.log('🔄 Assigning role:', roleName, 'to user:', userId);
    
    try {
      const role = await this.roleModel.findOne({ name: roleName });
      if (!role) {
        throw new NotFoundException(`Role ${roleName} not found`);
      }

      const user = await this.userModel.findByIdAndUpdate(
        userId,
        { role: roleName },
        { new: true }
      ).select('-password');

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const permissions = await this.getUserPermissions(userId);
      
      const userObj = user.toObject();
      return {
        ...userObj,
        permissions: permissions
      };
    } catch (error) {
      console.error('❌ Error in assignRole:', error);
      throw error;
    }
  }

  async getUserPermissions(userId: string): Promise<string[]> {
    const user = await this.userModel.findById(userId);
    if (!user) return [];

    const role = await this.roleModel.findOne({ name: user.role });
    return role?.permissions || [];
  }

  async createRole(name: string, description: string, permissions: string[] = []): Promise<RoleDocument> {
    const existingRole = await this.roleModel.findOne({ name });
    if (existingRole) {
      return existingRole;
    }

    const role = new this.roleModel({ name, description, permissions });
    return role.save();
  }

  async getAllRoles(): Promise<RoleDocument[]> {
    try {
      console.log('🔄 Getting all roles from database...');
      const roles = await this.roleModel.find().exec();
      console.log('✅ Found roles:', roles.length);
      return roles.map(role => role.toObject());
    } catch (error) {
      console.error('❌ Error getting roles:', error);
      console.error('Error details:', error.message);
      throw error;
    }
  }

  async getRoleByName(roleName: string): Promise<RoleDocument | null> {
    return this.roleModel.findOne({ name: roleName });
  }

  async findAll(): Promise<UserDocument[]> {
    return this.userModel.find().select('-password').exec();
  }

  async seedRoles() {
    const roles = [
      {
        name: 'admin',
        description: 'System Administrator',
        permissions: [
          'users:read', 'users:write', 'users:delete',
          'products:read', 'products:write', 'products:delete', 'products:bulk_operations',
          'orders:read', 'orders:write', 'orders:delete',
          'brands:read', 'brands:write', 'brands:delete',
          'admin:access'
        ]
      },
      {
        name: 'shop_manager',
        description: 'Shop Manager',
        permissions: [
          'products:read', 'products:write', 
          'orders:read', 'orders:write',
          'brands:read', 'brands:write'
        ]
      },
      {
        name: 'shop_employee',
        description: 'Shop Employee',
        permissions: [
          'products:read', 'products:write',
          'orders:read'
        ]
      },
      {
        name: 'customer',
        description: 'Customer',
        permissions: [
          'products:read',
          'orders:read', 'orders:write'
        ]
      }
    ];

    for (const roleData of roles) {
      await this.createRole(roleData.name, roleData.description, roleData.permissions);
    }
    
    console.log('Roles seeded successfully');
    return { message: 'Roles seeded successfully' };
  }
}