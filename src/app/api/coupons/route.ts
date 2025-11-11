import { NextResponse } from 'next/server';
import { getAvailableCoupons } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const coupons = getAvailableCoupons();
  return NextResponse.json(coupons);
}
