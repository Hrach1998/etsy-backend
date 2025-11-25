// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User, UserSchema } from './schemas/user.schema';
import { UsersModule } from '../users/users.module'; // ✅ Ավելացնել UsersModule
import { JwtStrategy } from './strategies/jwt.strategy';
import { RolesGuard } from './guards/roles.guard';
import { PermissionsGuard } from './guards/permissions.guard';

@Module({
  imports: [
    UsersModule, // ✅ Ավելացնել UsersModule (կարևոր է UserService-ի համար)
    PassportModule, // ✅ Ավելացնել PassportModule
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.register({
      secret: 'vortex-secret-key-2024',
      signOptions: { expiresIn: '24h' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy, // ✅ Ավելացնել JwtStrategy
    RolesGuard, // ✅ Ավելացնել RolesGuard
    PermissionsGuard, // ✅ Ավելացնել PermissionsGuard
  ],
  exports: [
    JwtModule, 
    AuthService,
    RolesGuard, // ✅ Export անել guards-ները
    PermissionsGuard,
  ],
})
export class AuthModule {}