// src/auth/strategies/jwt.strategy.ts - ՎԵՐՋԻՆ ՈՒՂՂՈՒՄ
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { UserService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'vortex-secret-key-2024',
    });
  }

  async validate(payload: any) {
    console.log('🔐 JWT Payload in validate:', payload);
    
    // ✅ FALLBACK - ԵՐԲ ԵՐԿ sub ՉԿԱ, ՕԳՏԱԳՈՐԾԵԼ id
    const userId = payload.sub || payload.id;
    console.log('🆔 Extracted user ID from token:', userId);
    
    if (!userId) {
      console.error('❌ No user ID found in JWT payload');
      return null;
    }

    const user = await this.userService.findById(userId);
    
    if (!user) {
      console.error('❌ User not found with ID:', userId);
      return null;
    }

    console.log('✅ User found in database:', user.email);
    
    const userPermissions = await this.userService.getUserPermissions(userId);

    // Add helper methods to user object
    const userObj = (user as any).toObject ? (user as any).toObject() : user;
    
    // ✅ ՀԱՍՏՏՈՒՄ ԵՆՔ, ՈՐ userObj-ն ՈՒՆԻ _id
    userObj._id = userObj._id || userId;
    
    userObj.hasRole = (roleName: string) => {
      return userObj.role === roleName;
    };
    
    userObj.hasPermission = (permission: string) => {
      return userPermissions.includes(permission);
    };

    userObj.getPermissions = () => {
      return userPermissions;
    };

    console.log('✅ Final user object for request:', {
      _id: userObj._id,
      email: userObj.email,
      role: userObj.role
    });

    return userObj;
  }
}