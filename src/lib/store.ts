export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
  total: number;
}

export interface Order {
  id: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  discountCode: string | null;
  timestamp: string;
}

export interface DiscountCode {
  code: string;
  isUsed: boolean;
  generatedAt: string;
  usedAt: string | null;
}

export const DISCOUNT_AVAILABLE_INTERVAL = 3;
export const DISCOUNT_PERCENTAGE = 10;

export const products: Product[] = [
  { id: 1, name: "MacBook Pro", price: 50000, image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&h=300&fit=crop" },
  { id: 2, name: "Wireless Mouse", price: 1000, image: "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=300&fit=crop" },
  { id: 3, name: "Mechanical Keyboard", price: 3000, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop" },
  { id: 4, name: "4K Monitor", price: 15000, image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop" },
  { id: 5, name: "Noise Cancelling Headphones", price: 5000, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop" },
];

export const cart: Cart = {
  items: [],
  total: 0,
};

export const orders: Order[] = [];
export const discountCodes: DiscountCode[] = [];

// Cookie helper functions
export function getCartFromCookie(cookieValue: string | undefined): Cart {
  if (!cookieValue) {
    return { items: [], total: 0 };
  }
  try {
    const decoded = decodeURIComponent(cookieValue);
    return JSON.parse(decoded);
  } catch {
    return { items: [], total: 0 };
  }
}

export function serializeCartToCookie(cart: Cart): string {
  return encodeURIComponent(JSON.stringify(cart));
}

export function calculateCartTotal(cartItems: CartItem[]): number {
  return cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function calculateDiscount(amount = 0, discountPer = DISCOUNT_PERCENTAGE): number {
  return Math.round((amount * discountPer) / 100);
}

export function addToCart(currentCart: Cart, productId: number, quantity: number = 1): { success: boolean; message?: string; cart: Cart } {
  if (quantity < 1) {
    return { success: false, message: "Quantity must be at least 1", cart: currentCart };
  }

  const product = products.find(p => p.id === productId);
  if (!product) {
    return { success: false, message: "Product not found", cart: currentCart };
  }

  const newCart = { ...currentCart, items: [...currentCart.items] };
  const existingItem = newCart.items.find(item => item.productId === productId);

  if (existingItem) {
    existingItem.quantity += quantity;
  } else {
    newCart.items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
    });
  }

  newCart.total = calculateCartTotal(newCart.items);
  return { success: true, cart: newCart };
}

export function getCart(currentCart: Cart): Cart {
  return { ...currentCart };
}

export function updateCartQuantity(currentCart: Cart, productId: number, quantity: number): { success: boolean; message?: string; cart: Cart } {
  const newCart = { ...currentCart, items: [...currentCart.items] };
  const item = newCart.items.find(item => item.productId === productId);

  if (!item) {
    return { success: false, message: "Item not found in cart", cart: currentCart };
  }

  if (quantity < 1) {
    return { success: false, message: "Quantity must be at least 1", cart: currentCart };
  }

  item.quantity = quantity;
  newCart.total = calculateCartTotal(newCart.items);
  return { success: true, cart: newCart };
}

export function removeFromCart(currentCart: Cart, productId: number): { success: boolean; message?: string; cart: Cart } {
  const newCart = { ...currentCart, items: [...currentCart.items] };
  const itemIndex = newCart.items.findIndex(item => item.productId === productId);

  if (itemIndex === -1) {
    return { success: false, message: "Item not found in cart", cart: currentCart };
  }

  newCart.items.splice(itemIndex, 1);
  newCart.total = calculateCartTotal(newCart.items);
  return { success: true, cart: newCart };
}

export function clearCart(): Cart {
  return { items: [], total: 0 };
}

export function checkout(currentCart: Cart, discountCodeInput?: string): { success: boolean; message?: string; order?: Order; newDiscountCode?: string; cart: Cart } {
  if (currentCart.items.length === 0) {
    return { success: false, message: "Cart is empty", cart: currentCart };
  }

  const subtotal = calculateCartTotal(currentCart.items);
  let discount = 0;
  let validDiscountCode: string | null = null;

  if (discountCodeInput) {
    const code = discountCodes.find(c => c.code === discountCodeInput);
    if (!code) {
      return { success: false, message: "Invalid or already used discount code", cart: currentCart };
    }
    if (code.isUsed) {
      return { success: false, message: "Invalid or already used discount code", cart: currentCart };
    }

    discount = calculateDiscount(subtotal);
    validDiscountCode = discountCodeInput;
    code.isUsed = true;
    code.usedAt = new Date().toISOString();
  }

  const total = subtotal - discount;
  const order: Order = {
    id: `ORDER-${orders.length + 1}-${Date.now()}`,
    items: [...currentCart.items],
    subtotal,
    discount,
    total,
    discountCode: validDiscountCode,
    timestamp: new Date().toISOString(),
  };

  orders.push(order);
  const emptyCart = clearCart();

  const orderNumber = orders.length;
  let newDiscountCode: string | undefined;

  if (orderNumber % DISCOUNT_AVAILABLE_INTERVAL === 0) {
    const code = `SAVE10_${orderNumber}`;
    discountCodes.push({
      code,
      isUsed: false,
      generatedAt: new Date().toISOString(),
      usedAt: null,
    });
    newDiscountCode = code;
  }

  return { success: true, order, newDiscountCode, cart: emptyCart };
}

export function getAvailableCoupons(): DiscountCode[] {
  return discountCodes.filter(c => !c.isUsed).map(c => ({ ...c }));
}

export function getAdminStats() {
  const totalOrders = orders.length;
  const totalItemsPurchased = orders.reduce((sum, order) =>
    sum + order.items.reduce((itemSum, item) => itemSum + item.quantity, 0), 0
  );
  const totalPurchaseAmount = orders.reduce((sum, order) => sum + order.total, 0);
  const totalDiscountGiven = orders.reduce((sum, order) => sum + order.discount, 0);

  return {
    totalOrders,
    totalItemsPurchased,
    totalPurchaseAmount,
    totalDiscountGiven,
    discountCodes: discountCodes.map(c => ({ ...c })),
  };
}
