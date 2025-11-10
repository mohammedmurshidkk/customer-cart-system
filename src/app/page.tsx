'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { products } from '@/lib/store';
import { useTheme } from 'next-themes';

export default function Home() {
  const [cartCount, setCartCount] = useState(0);
  const [addedProductId, setAddedProductId] = useState<number | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const res = await fetch('/api/cart');
    const cart = await res.json();
    const count = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    setCartCount(count);
  };

  const handleAddToCart = async (productId: number) => {
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, quantity: 1 }),
    });

    if (res.ok) {
      setAddedProductId(productId);
      setTimeout(() => setAddedProductId(null), 1000);
      fetchCart();
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Store</h1>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <Link
                href="/cart"
                className="px-4 py-2 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Cart ({cartCount})
              </Link>
              <Link
                href="/admin"
                className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-8">Products</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group cursor-pointer">
              <div className="relative aspect-[4/3] mb-4 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-medium text-gray-900 dark:text-white">{product.name}</h3>
                <p className="text-base font-medium text-gray-900 dark:text-white">₹{product.price.toLocaleString()}</p>
              </div>
              <button
                onClick={() => handleAddToCart(product.id)}
                className={`w-full py-2.5 text-sm font-medium rounded-lg transition-all ${
                  addedProductId === product.id
                    ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                    : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                }`}
              >
                {addedProductId === product.id ? 'Added!' : 'Add to Cart'}
              </button>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
