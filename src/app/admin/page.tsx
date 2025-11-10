'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';

interface DiscountCode {
  code: string;
  isUsed: boolean;
  generatedAt: string;
  usedAt: string | null;
}

interface Stats {
  totalOrders: number;
  totalItemsPurchased: number;
  totalPurchaseAmount: number;
  totalDiscountGiven: number;
  discountCodes: DiscountCode[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 3000);
    return () => clearInterval(interval);
  }, []);

  const fetchStats = async () => {
    const res = await fetch('/api/admin/stats');
    const data = await res.json();
    setStats(data);
  };

  if (!stats) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-xl text-gray-900 dark:text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors">
      <nav className="border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Admin Dashboard</h1>
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
                Back to Shop
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Orders</h3>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{stats.totalOrders}</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Items Purchased</h3>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">{stats.totalItemsPurchased}</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Purchase Amount</h3>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">₹{stats.totalPurchaseAmount.toLocaleString()}</p>
          </div>

          <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Total Discount Given</h3>
            <p className="text-3xl font-semibold text-gray-900 dark:text-white">₹{stats.totalDiscountGiven.toLocaleString()}</p>
          </div>
        </div>

        <div className="border border-gray-200 dark:border-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Discount Codes</h2>

          {stats.discountCodes.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-base text-gray-900 dark:text-white mb-2">No discount codes generated yet</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Complete 3 orders to generate the first discount code</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Code</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Generated At</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">Used At</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.discountCodes.map((code) => (
                    <tr key={code.code} className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <td className="py-4 px-4 font-mono font-medium text-gray-900 dark:text-white">{code.code}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            code.isUsed
                              ? 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                              : 'bg-gray-900 dark:bg-white text-white dark:text-gray-900'
                          }`}
                        >
                          {code.isUsed ? 'Used' : 'Available'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {new Date(code.generatedAt).toLocaleString()}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
                        {code.usedAt ? new Date(code.usedAt).toLocaleString() : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
