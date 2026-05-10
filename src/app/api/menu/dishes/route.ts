import { NextResponse } from 'next/server';
import { MOCK_DISHES } from '../../mockData';

export async function GET(request: Request) {
  // Lấy params từ URL nếu cần lọc (category, isAvailable)
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const isAvailable = searchParams.get('isAvailable');

  let filteredDishes = [...MOCK_DISHES];

  if (category) {
    filteredDishes = filteredDishes.filter(d => d.category === category);
  }
  if (isAvailable !== null) {
    const isAvailBool = isAvailable === 'true';
    filteredDishes = filteredDishes.filter(d => d.available === isAvailBool);
  }

  // Giả lập delay mạng 500ms
  await new Promise((resolve) => setTimeout(resolve, 500));

  return NextResponse.json(filteredDishes);
}
