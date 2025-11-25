import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { ProductsModule } from '../products/products.module';
import { AuthModule } from '../auth/auth.module';
import { AdminGuard } from './admin.guard';

@Module({
  imports: [
    ProductsModule, // ✅ ProductsService-ի համար
    AuthModule,     // ✅ AuthService-ի և JwtService-ի համար
  ],
  controllers: [AdminController],
  providers: [AdminGuard], // ✅ Ավելացնել AdminGuard-ը providers-ում
})
export class AdminModule {}