import { NextResponse } from 'next/server';
import { MOCK_DISHES } from '../../../mockData';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ dishId: string }> }
) {
  const resolvedParams = await params;
  const dishId = parseInt(resolvedParams.dishId);
  const dish = MOCK_DISHES.find((d) => d.dishId === dishId);

  if (!dish) {
    return NextResponse.json({ error: 'Món ăn không tồn tại' }, { status: 404 });
  }

  return NextResponse.json(dish);
}
