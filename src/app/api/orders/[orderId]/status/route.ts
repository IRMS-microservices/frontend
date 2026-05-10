import { NextResponse } from 'next/server';
import { mockOrdersDb } from '../../../mockData';
import { ServiceStatus } from '@/types/api.types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const resolvedParams = await params;
  const orderId = parseInt(resolvedParams.orderId);
  const body = await request.json();
  const newStatus = body.serviceStatus as ServiceStatus;

  const updatedOrder = mockOrdersDb.updateOrder(orderId, (order) => {
    order.serviceStatus = newStatus;
  });

  if (!updatedOrder) {
    return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 });
  }

  return NextResponse.json(updatedOrder);
}
