import { NextResponse } from 'next/server';
import { mockOrdersDb } from '../../mockData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const resolvedParams = await params;
  const orderId = parseInt(resolvedParams.orderId);
  const order = mockOrdersDb.getOrderById(orderId);

  if (!order) {
    return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 });
  }

  return NextResponse.json(order);
}
