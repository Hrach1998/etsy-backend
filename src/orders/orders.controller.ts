// backend/src/orders/orders.controller.ts - FIXED VERSION
import { 
  Controller, 
  Get, 
  Post, 
  Patch, 
  Body, 
  Param, 
  Query, 
  Req, 
  UseGuards,
  ParseArrayPipe 
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDto: CreateOrderDto, @Req() req) {
    console.log('📥 Creating order with data:', createOrderDto);
    
    // ✅ ՕԳՏԱԳՈՐԾԵԼ ԻՐԱԿԱՆ USER_ID ORDER DATA-ից
    const userId = createOrderDto.userId;
    
    if (!userId) {
      throw new Error('User ID is required in order data');
    }
    
    console.log('👤 Using user ID from order data:', userId);
    return this.ordersService.createOrder(createOrderDto, userId);
  }

  @Get('user/my-orders')
  async getUserOrders(@Req() req) {
    console.log('🔍 Getting user orders - Full request:', req);
    
    // ✅ ՍՏԱՆԱԼ USER_ID QUERY PARAMETER-ից
    const userId = req.query.userId;
    
    if (!userId) {
      console.error('❌ User ID not found in query parameters');
      console.log('🔍 Available query parameters:', req.query);
      throw new Error('User ID is required as query parameter');
    }
    
    console.log('👤 Using user ID from query:', userId);
    return this.ordersService.getUserOrders(userId);
  }

  @Get('user/:userId')
  async getUserOrdersByParam(@Param('userId') userId: string) {
    console.log('🔍 Getting orders for user ID from URL params:', userId);
    return this.ordersService.getUserOrders(userId);
  }

  @Get('admin/all-orders')
  async getAllOrders(@Query() query: any) {
    return this.ordersService.getAllOrders(query);
  }

  @Patch('admin/:id/status')
  async updateOrderStatus(
    @Param('id') id: string, 
    @Body() updateStatusDto: UpdateOrderStatusDto
  ) {
    return this.ordersService.updateOrderStatus(id, updateStatusDto);
  }

  @Get(':id')
  async getOrderById(@Param('id') id: string) {
    return this.ordersService.getOrderById(id);
  }
}