import { NextResponse } from 'next/server';
import { CreateOrderRequest, OrderResponse } from '@/types/api.types';
import { mockOrdersDb, MOCK_DISHES } from '../mockData';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tableId = searchParams.get('tableId');
  
  let filtered = [...mockOrdersDb.getOrders()];
  if (tableId) {
    filtered = filtered.filter(o => o.tableId === parseInt(tableId));
  }
  
  return NextResponse.json(filtered);
}

export async function POST(request: Request) {
  try {
    const body: CreateOrderRequest = await request.json();
    
    const newOrder: OrderResponse = {
      orderId: mockOrdersDb.getNextId(),
      tableId: body.tableId,
      customerId: body.customerId,
      totalAmount: 0, // Sẽ tính bên dưới
      paymentStatus: 'Unpaid',
      serviceStatus: 'Waiting',
      note: body.note || null,
      createdBy: 1, 
      createdAt: new Date().toISOString(),
      items: body.items.map((item, index) => {
        const dish = MOCK_DISHES.find(d => d.dishId === item.dishId);
        return {
          itemId: index + 1,
          dishId: item.dishId,
          dishName: dish ? dish.name : `Món ăn #${item.dishId}`, 
          quantity: item.quantity,
          salePrice: dish ? dish.basePrice : 100000,
          notes: item.notes || null
        };
      })
    };

    // Tính lại tổng tiền dựa trên giá trị thực tế của items
    newOrder.totalAmount = newOrder.items.reduce((sum, item) => sum + (item.quantity * item.salePrice), 0);
    
    mockOrdersDb.addOrder(newOrder);
    
    await new Promise(r => setTimeout(r, 600));

    return NextResponse.json(newOrder, { status: 201 });
  } catch (_error) {
    return NextResponse.json({ error: 'Lỗi khi tạo đơn hàng' }, { status: 400 });
  }
}
