import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { AdminModule } from './admin/admin.module';
import { BrandsModule } from './brands/brands.module';
import { UsersModule } from './users/users.module'; // ✅ Ավելացնել
import { OrdersModule } from './orders/orders.module'; // ✅ Ավելացնել

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://127.0.0.1:27017/vortex-store'),
    AuthModule,
    ProductsModule,
    AdminModule,
    BrandsModule,
    UsersModule, // ✅ Ավելացնել
    OrdersModule, // ✅ Ավելացնել
  ],
  controllers: [AppController],
})
export class AppModule {}