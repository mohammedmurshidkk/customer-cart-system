import { NextResponse } from 'next/server';
import { getAdminStats } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const stats = getAdminStats();
  return NextResponse.json(stats);
}
