import { NextRequest, NextResponse } from 'next/server';
import { checkout } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { discountCode } = body;

    const result = checkout(discountCode);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      order: result.order,
      newDiscountCode: result.newDiscountCode,
      message: result.newDiscountCode
        ? `Order placed successfully! Congratulations! You've earned a discount code: ${result.newDiscountCode}`
        : "Order placed successfully!"
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
