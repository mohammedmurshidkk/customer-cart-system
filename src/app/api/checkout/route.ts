import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { checkout, getCartFromCookie, serializeCartToCookie } from '@/lib/store';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const CART_COOKIE_NAME = 'shopping_cart';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { discountCode } = body;

    const cookieStore = await cookies();
    const cartCookie = cookieStore.get(CART_COOKIE_NAME);
    const currentCart = getCartFromCookie(cartCookie?.value);

    const result = checkout(currentCart, discountCode);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    const response = NextResponse.json({
      order: result.order,
      newDiscountCode: result.newDiscountCode,
      message: result.newDiscountCode
        ? `Order placed successfully! Congratulations! You've earned a discount code: ${result.newDiscountCode}`
        : "Order placed successfully!"
    });

    // Clear cart cookie after successful checkout
    response.cookies.set(CART_COOKIE_NAME, serializeCartToCookie(result.cart), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
