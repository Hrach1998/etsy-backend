// src/auth/auth.module.ts - ՈՒՂՂՎԱԾ
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { VerificationService } from './verification.service';
import { User, UserSchema } from './schemas/user.schema';
import { VerificationCode, VerificationCodeSchema } from './schemas/verification-code.schema'; // ✅ ԱՎԵԼԱՑՆԵԼ
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: VerificationCode.name, schema: VerificationCodeSchema }, // ✅ ԱՎԵԼԱՑՆԵԼ
    ]),
    JwtModule.register({
      secret: 'vortex-secret-key-2024',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    VerificationService, // ✅ ԱՎԵԼԱՑՆԵԼ
    JwtStrategy,
    RolesGuard,
    PermissionsGuard,
  ],
  exports: [
    JwtModule, 
    AuthService,
    VerificationService, // ✅ ԱՎԵԼԱՑՆԵԼ
    RolesGuard,
    PermissionsGuard,
  ],
})
export class AuthModule {}