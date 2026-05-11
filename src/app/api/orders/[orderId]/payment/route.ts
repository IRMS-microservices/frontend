import { NextResponse } from 'next/server';
import { mockOrdersDb } from '../../../mockData';
import { PaymentStatus } from '@/types/menuOrder.types';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ orderId: string }> }
) {
  const resolvedParams = await params;
  const orderId = parseInt(resolvedParams.orderId);
  const body = await request.json();
  const newPaymentStatus = body.paymentStatus as PaymentStatus;

  const updatedOrder = mockOrdersDb.updateOrder(orderId, (order) => {
    order.paymentStatus = newPaymentStatus;
  });

  if (!updatedOrder) {
    return NextResponse.json({ error: 'Đơn hàng không tồn tại' }, { status: 404 });
  }

  return NextResponse.json(updatedOrder);
}
