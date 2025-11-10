'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { DISCOUNT_PERCENTAGE, calculateDiscount } from '@/lib/store';

interface CartItem {
  productId: number;
  name: string;
  price: number;
  quantity: number;
}

interface Cart {
  items: CartItem[];
  total: number;
}

interface Coupon {
  code: string;
  isUsed: boolean;
  generatedAt: string;
  usedAt: string | null;
}

export default function CartPage() {
  const [cart, setCart] = useState<Cart>({ items: [], total: 0 });
  const [discountCode, setDiscountCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchCart();
    fetchCoupons();
  }, []);

  const fetchCart = async () => {
    const res = await fetch('/api/cart');
    const data = await res.json();
    setCart(data);
  };

  const fetchCoupons = async () => {
    const res = await fetch('/api/coupons');
    const data = await res.json();
    setAvailableCoupons(data);
  };

  const handleUpdateQuantity = async (productId: number, quantity: number) => {
    const res = await fetch('/api/cart', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity }),
    });

    if (res.ok) {
      fetchCart();
    }
  };

  const handleRemoveItem = async (productId: number) => {
    const res = await fetch('/api/cart', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId }),
    });

    if (res.ok) {
      fetchCart();
    }
  };

  const grandTotal = (discountCode && cart.total > 0) ? cart.total - calculateDiscount(cart.total) : cart.total 

  const handleCheckout = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ discountCode: discountCode || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setLoading(false);
        return;
      }

      setSuccess(data.message);
      setDiscountCode('');
      fetchCart();
      fetchCoupons();
      setLoading(false);
    } catch (err) {
      setError('Checkout failed');
      setLoading(false);
    }
  };

  if (cart.items.length === 0 && !success) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
        <nav className="border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Cart</h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {theme === 'light' ? '🌙' : '☀️'}
                </button>
                <Link
                  href="/"
                  className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-4xl mx-auto px-6 py-24 text-center">
          <div className="text-6xl mb-6">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">Your cart is empty</h2>
          <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
            Browse products
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Cart</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <Link
                href="/"
                className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {success && (
          <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white rounded-lg">
            {success}
          </div>
        )}

        {cart.items.length > 0 && (
          <>
            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Your Items</h2>
              <div className="space-y-6">
                {cart.items.map((item) => (
                  <div key={item.productId} className="flex justify-between items-start border-b border-gray-200 dark:border-gray-800 pb-6 last:border-0 last:pb-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-2">{item.name}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">₹{item.price.toLocaleString()} each</p>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          -
                        </button>
                        <span className="text-base font-medium text-gray-900 dark:text-white w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          className="w-8 h-8 flex items-center justify-center border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                        >
                          +
                        </button>
                        <button
                          onClick={() => handleRemoveItem(item.productId)}
                          className="ml-2 text-sm text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">₹{(item.price * item.quantity).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-base text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="text-base text-gray-900 dark:text-white">₹{cart.total.toLocaleString()}</span>
                </div>
                {discountCode && (
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-base text-gray-600 dark:text-gray-400">{`Discount (${DISCOUNT_PERCENTAGE}%)`}</span>
                    <span className="text-base text-green-600 dark:text-green-400">-₹{calculateDiscount(cart.total).toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-800">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">Total</span>
                  <span className="text-xl font-semibold text-gray-900 dark:text-white">₹{grandTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Checkout</h2>

              {error && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg">
                  {error}
                </div>
              )}

              {availableCoupons.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-3">Available Coupons</label>
                  <div className="flex flex-wrap gap-2">
                    {availableCoupons.map((coupon) => (
                      <button
                        key={coupon.code}
                        onClick={() => setDiscountCode(coupon.code)}
                        className={`px-4 py-2 text-sm font-mono border rounded-lg transition-colors ${
                          discountCode === coupon.code
                            ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                            : 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700 hover:border-gray-900 dark:hover:border-white'
                        }`}
                      >
                        {coupon.code}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">Discount Code (Optional)</label>
                <input
                  type="text"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value.trim())}
                  placeholder="Enter discount code"
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                />
              </div>

              <button
                onClick={handleCheckout}
                disabled={loading}
                className="w-full py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-base font-medium rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
