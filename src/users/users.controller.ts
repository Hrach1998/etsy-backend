// src/users/users.controller.ts - ՈՒՂՂՎԱԾ ՎԵՐՍԻԱ
import { Controller, Get, Put, Body, Req, Param, Post, UseGuards } from '@nestjs/common';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private readonly userService: UserService) {}

  // ✅ User profile endpoints
  @Get('profile')
async getProfile(@Req() req) {
  console.log('🔍 GetProfile - Full user object:', req.user);
  
  // ✅ FALLBACK - ԵՐԲ _id ՉԿԱ, ՕԳՏԱԳՈՐԾԵԼ id
  const userId = req.user._id || req.user.id;
  console.log('🆔 User ID from req.user:', userId);
  
  if (!userId) {
    console.error('❌ No user ID found in request');
    throw new Error('User not authenticated');
  }
  
  return this.userService.getUserProfile(userId);
}

@Put('profile')
async updateProfile(@Req() req, @Body() updateUserDto: UpdateUserDto) {
  console.log('✏️ UpdateProfile - Full user object:', req.user);
  
  // ✅ ՆՈՒՅՆ FALLBACK
  const userId = req.user._id || req.user.id;
  console.log('🆔 User ID for update:', userId);
  
  if (!userId) {
    console.error('❌ No user ID found in request');
    throw new Error('User not authenticated');
  }
  
  const result = await this.userService.updateUserProfile(userId, updateUserDto);
  console.log('✅ Update result:', result);
  return result;
}

  @Get('profile/orders')
  async getUserOrders(@Req() req) {
    const userId = req.user.id || req.user.sub || req.user._id;
    console.log('📦 Getting orders for user:', userId);
    return { message: 'User orders', userId };
  }

  // ✅ Admin only endpoints
  @Get()
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findAll() {
    return this.userService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async findOne(@Param('id') id: string) {
    return this.userService.findById(id);
  }

  @Put(':id/role')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async assignRole(
    @Param('id') id: string,
    @Body() assignRoleDto: { roleName: string }
  ) {
    console.log('🎯 Assign role endpoint called for user:', id);
    console.log('📝 Role to assign:', assignRoleDto.roleName);
    
    try {
      const updatedUser = await this.userService.assignRole(id, assignRoleDto.roleName);
      console.log('✅ Role assigned successfully');
      return updatedUser;
    } catch (error) {
      console.error('❌ Error assigning role:', error);
      throw error;
    }
  }

  @Get('roles/all')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async getAllRoles(@Req() req) {
    console.log('🎯 Get all roles endpoint called by:', req.user?.email);
    try {
      console.log('🔄 Fetching roles from database...');
      const roles = await this.userService.getAllRoles();
      console.log('✅ Roles fetched successfully:', roles.length);
      return roles;
    } catch (error) {
      console.error('❌ ERROR in getAllRoles:', error);
      console.error('Error stack:', error.stack);
      throw error;
    }
  }

  @Post('seed-roles')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async seedRoles() {
    return this.userService.seedRoles();
  }
}