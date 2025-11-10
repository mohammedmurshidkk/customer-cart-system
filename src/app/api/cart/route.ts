import { NextRequest, NextResponse } from 'next/server';
import { addToCart, getCart, removeFromCart, updateCartQuantity } from '@/lib/store';

export async function GET() {
  const cart = getCart();
  return NextResponse.json(cart);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1 } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const result = addToCart(productId, quantity);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    const cart = getCart();
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || quantity === undefined) {
      return NextResponse.json(
        { error: "Product ID and quantity are required" },
        { status: 400 }
      );
    }

    const result = updateCartQuantity(productId, quantity);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    const cart = getCart();
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const result = removeFromCart(productId);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    const cart = getCart();
    return NextResponse.json(cart);
  } catch (error) {
    return NextResponse.json(
      { error: "Invalid request" },
      { status: 400 }
    );
  }
}
