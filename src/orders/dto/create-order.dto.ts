// backend/src/orders/dto/create-order.dto.ts
export class OrderItemDto {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  image?: string;
  size?: string; // ✅ Ավելացնել size, եթե կա
}

export class CreateOrderDto {
  userId: string; // ✅ ✅ ✅ ԱՎԵԼԱՑՆԵԼ USER_ID
  items: OrderItemDto[];
  shippingAddress: string;
  phone: string;
  notes?: string;
  totalAmount?: number; // ✅ Կարող եք ավելացնել նաև totalAmount
}