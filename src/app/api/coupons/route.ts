import { NextResponse } from 'next/server';
import { getAvailableCoupons } from '@/lib/store';

export async function GET() {
  const coupons = getAvailableCoupons();
  return NextResponse.json(coupons);
}
