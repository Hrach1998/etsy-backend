// order.service.ts - COMPLETE FIXED VERSION
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Order, OrderDocument } from './schemas/order.schema';
import { Product, ProductDocument } from '../products/schemas/product.schema';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto, userId: string): Promise<Order> {
    const orderNumber = this.generateOrderNumber();
    
    const totalAmount = createOrderDto.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);

    const orderData = {
      ...createOrderDto,
      userId,
      orderNumber,
      totalAmount,
    };

    const createdOrder = new this.orderModel(orderData);
    return createdOrder.save();
  }

  async getUserOrders(userId: string): Promise<Order[]> {
    return this.orderModel
      .find({ userId })
      .populate('items.productId', 'name images price')
      .sort({ createdAt: -1 })
      .exec();
  }

  async getAllOrders(query: any = {}): Promise<Order[]> {
    const { status, page = 1, limit = 10 } = query;
    
    const filter: any = {};
    if (status) filter.status = status;

    return this.orderModel
      .find(filter)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name images')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
  }

  async updateOrderStatus(orderId: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderModel.findById(orderId)
      .populate('userId', 'name email');
    
    if (!order) {
      throw new NotFoundException('Order not found');
    }
  
    const oldStatus = order.status;
    const newStatus = updateStatusDto.status;
  
    console.log(`🔄 Order status change: ${oldStatus} -> ${newStatus}`);
  
    // ✅ ԵԹԵ ՊԱՏՎԵՐԸ ՀԱՍՏԱՏՎՈՒՄ Է (ԱՆԿԱԽ ԿԱՐԳԱՎԻԹԱԿԻՑ), ԿՐԳԱՎՈՐԵԼ ԱՊՐԱՆՔՆԵՐԻ ՔԱՆԱԿԸ ԵՎ ԱՎԵԼԱՑՆԵԼ SALES HISTORY
    if (newStatus === 'confirmed') {
      console.log('✅ Confirming order, updating stock and sales history...');
      
      // ✅ ՍՏՈՒԳԵԼ, ՈՐ ԱՊՐԱՆՔՆԵՐԻ ՔԱՆԱԿԸ ԴՈՒՐՍ ՉԷ ԿՐԳԱՎՈՐՎԵԼ
      if (oldStatus !== 'confirmed') {
        await this.decreaseProductStock(order.items);
        await this.addToSalesHistory(order);
      } else {
        console.log('ℹ️ Order already confirmed, skipping stock update');
      }
    }
  
    // ✅ ԵԹԵ ՊԱՏՎԵՐԸ ՉԵՂԱՐԿՎՈՒՄ Է, ՎԵՐԱԴԱՐՁՆԵԼ ԱՊՐԱՆՔՆԵՐԻ ՔԱՆԱԿԸ
    if (newStatus === 'cancelled' && oldStatus === 'confirmed') {
      console.log('❌ Cancelling order, restoring stock...');
      await this.increaseProductStock(order.items);
      await this.removeFromSalesHistory(orderId);
    }
  
    // ✅ ԵԹԵ ՊԱՏՎԵՐԸ ՊԱՏՎԻՐՎՈՒՄ Է, ԱՎԵԼԱՑՆԵԼ TOTAL SALES
    if (newStatus === 'delivered') {
      console.log('📦 Delivering order, updating total sales...');
      await this.updateProductSales(order.items);
    }
  
    // ✅ ԹԱՐՄԱՑՆԵԼ ՊԱՏՎԵՐԻ ԿԱՐԳԱՎԻԹԱԿԸ
    const updatedOrder = await this.orderModel.findByIdAndUpdate(
      orderId,
      { 
        $set: updateStatusDto,
        ...(newStatus === 'confirmed' && { confirmedAt: new Date() }),
        ...(newStatus === 'cancelled' && { cancelledAt: new Date() }),
        ...(newStatus === 'delivered' && { deliveredAt: new Date() })
      },
      { new: true }
    )
    .populate('userId', 'name email')
    .populate('items.productId', 'name images price stock');
  
    if (!updatedOrder) {
      throw new NotFoundException('Order not found after update');
    }
  
    console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
    return updatedOrder;
  }

  // ✅ ԱՊՐԱՆՔՆԵՐԻ ՔԱՆԱԿԻ ԿՐԳԱՎՈՐՈՒՄ (հաստատման դեպքում)
  private async decreaseProductStock(items: any[]): Promise<void> {
    for (const item of items) {
      await this.productModel.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { stock: -item.quantity },
          $set: { updatedAt: new Date() }
        }
      );
    }
    console.log(`✅ Product stock decreased for order items`);
  }

  // ✅ ԱՊՐԱՆՔՆԵՐԻ ՔԱՆԱԿԻ ՎԵՐԱԴԱՐՁՈՒՄ (չեղարկման դեպքում)
  private async increaseProductStock(items: any[]): Promise<void> {
    for (const item of items) {
      await this.productModel.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { stock: item.quantity },
          $set: { updatedAt: new Date() }
        }
      );
    }
    console.log(`✅ Product stock increased for cancelled order`);
  }

  // ✅ ԱՎԵԼԱՑՆԵԼ SALES HISTORY PRODUCT-ՈՒՄ - FIXED VERSION
  private async addToSalesHistory(order: any): Promise<void> {
    console.log(`📊 Adding sales history for order ${order.orderNumber}`);
    
    for (const item of order.items) {
      // ✅ ՍՏԵՂԾԵԼ COMPLETE SALE RECORD բոլոր պարտադիր դաշտերով
      const saleRecord = {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        customerName: order.userId?.name || 'Unknown Customer',
        quantitySold: item.quantity,
        unitPrice: item.price,
        totalAmount: item.price * item.quantity,
        soldBy: 'admin', // Կամ օգտագործել իրական admin ID
        saleDate: new Date(),
      };

      console.log(`➕ Adding sale record for product ${item.productId}:`, saleRecord);

      // ✅ ՕԳՏԱԳՈՐԾԵԼ ՃՇՏ ԱՆՈՒՆԸ՝ saleHistory (առանց "s")
      const result = await this.productModel.findByIdAndUpdate(
        item.productId,
        { 
          $push: { 
            saleHistory: saleRecord // ✅ ՈՒՂՂՈՒՄ՝ saleHistory instead of salesHistory
          },
          $inc: { totalSold: item.quantity },
          $set: { 
            updatedAt: new Date(),
            lastSoldAt: new Date()
          }
        },
        { new: true }
      );

      if (result) {
        console.log(`✅ Successfully added sale history for product: ${result.name}`);
        console.log(`✅ Product ${result.name} now has ${result.saleHistory?.length || 0} sales records`);
      } else {
        console.error(`❌ Failed to add sale history for product: ${item.productId}`);
      }
    }
  }

  // ✅ ՋՆՋԵԼ SALES HISTORY (չեղարկման դեպքում) - FIXED VERSION
  private async removeFromSalesHistory(orderId: string): Promise<void> {
    console.log(`🗑️ Removing sales history for order ${orderId}`);
    
    // ✅ ՕԳՏԱԳՈՐԾԵԼ ՃՇՏ ԱՆՈՒՆԸ՝ saleHistory (առանց "s")
    const products = await this.productModel.find({ 'saleHistory.orderId': orderId });
    
    for (const product of products) {
      const saleRecord = product.saleHistory.find(s => s.orderId === orderId);
      if (saleRecord) {
        await this.productModel.findByIdAndUpdate(
          product._id,
          { 
            $pull: { saleHistory: { orderId } }, // ✅ ՈՒՂՂՈՒՄ՝ saleHistory instead of salesHistory
            $inc: { totalSold: -saleRecord.quantitySold }
          }
        );
        console.log(`✅ Removed sale history for product: ${product.name}`);
      }
    }
  }

  // ✅ ԹԱՐՄԱՑՆԵԼ TOTAL SALES (պատվերելու դեպքում)
  private async updateProductSales(items: any[]): Promise<void> {
    for (const item of items) {
      await this.productModel.findByIdAndUpdate(
        item.productId,
        { 
          $inc: { totalSold: item.quantity },
          $set: { lastSoldAt: new Date() }
        }
      );
    }
    console.log(`✅ Total sales updated for delivered order`);
  }

  async getOrderById(orderId: string): Promise<Order> {
    const order = await this.orderModel
      .findById(orderId)
      .populate('userId', 'name email phone')
      .populate('items.productId', 'name images price stock')
      .exec();

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    return order;
  }

  // ✅ ՍՏԱՑՆԵԼ SALES HISTORY ԲՈԼՈՐ ԱՊՐԱՆՔՆԵՐԻ ՀԱՄԱՐ - FIXED VERSION
  async getSalesHistory(): Promise<any[]> {
    // ✅ ՕԳՏԱԳՈՐԾԵԼ ՃՇՏ ԱՆՈՒՆԸ՝ saleHistory (առանց "s")
    const products = await this.productModel
      .find({ 'saleHistory.0': { $exists: true } })
      .select('name saleHistory totalSold')
      .exec();

    return products;
  }

  // ✅ ՍՏԱՑՆԵԼ ՎԱՃԱՌՔՆԵՐԻ ՎԻՃԱԿԱԳՐՈՒԹՅՈՒՆ - FIXED VERSION
  async getSalesStats(): Promise<any> {
    const totalSales = await this.orderModel.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } }
    ]);

    const monthlySales = await this.orderModel.aggregate([
      { $match: { status: 'delivered' } },
      {
        $group: {
          _id: { 
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } }
    ]);

    // ✅ ՍՏԱՑՆԵԼ ԱՄԵՆԱ ՎԱՃԱՌՎՈՂ ԱՊՐԱՆՔՆԵՐԸ
    const topProducts = await this.productModel
      .find()
      .select('name totalSold price stock')
      .sort({ totalSold: -1 })
      .limit(10)
      .exec();

    return {
      totalRevenue: totalSales[0]?.total || 0,
      totalOrders: totalSales[0]?.count || 0,
      monthlySales,
      topProducts
    };
  }

  private generateOrderNumber(): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD-${timestamp}-${random}`;
  }
}