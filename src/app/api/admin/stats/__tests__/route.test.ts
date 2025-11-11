import { GET } from '../route';
import { clearCart, addToCart, checkout, discountCodes, orders } from '@/lib/store';

describe('Admin Stats API Route', () => {
  beforeEach(() => {
    clearCart();
    orders.length = 0;
    discountCodes.length = 0;
  });

  describe('GET /api/admin/stats', () => {
    it('should return zero stats when no orders exist', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalOrders).toBe(0);
      expect(data.totalItemsPurchased).toBe(0);
      expect(data.totalPurchaseAmount).toBe(0);
      expect(data.totalDiscountGiven).toBe(0);
      expect(data.discountCodes).toHaveLength(0);
    });

    it('should calculate stats for single order', async () => {
      addToCart(1, 2);
      checkout();

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalOrders).toBe(1);
      expect(data.totalItemsPurchased).toBe(2);
      expect(data.totalPurchaseAmount).toBe(100000);
      expect(data.totalDiscountGiven).toBe(0);
    });

    it('should calculate stats for multiple orders', async () => {
      addToCart(1, 1);
      checkout();

      addToCart(2, 2);
      checkout();

      addToCart(3, 1);
      checkout();

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalOrders).toBe(3);
      expect(data.totalItemsPurchased).toBe(4);
      expect(data.totalPurchaseAmount).toBe(55000);
    });

    it('should include discount in stats', async () => {
      discountCodes.push({
        code: 'SAVE10_3',
        isUsed: false,
        generatedAt: new Date().toISOString(),
        usedAt: null,
      });

      addToCart(1, 2);
      checkout('SAVE10_3');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalDiscountGiven).toBe(10000);
      expect(data.totalPurchaseAmount).toBe(90000);
    });

    it('should include all discount codes', async () => {
      addToCart(1, 1);
      checkout();
      addToCart(1, 1);
      checkout();
      addToCart(1, 1);
      checkout();

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.discountCodes).toHaveLength(1);
      expect(data.discountCodes[0].code).toBe('SAVE10_3');
      expect(data.discountCodes[0].isUsed).toBe(false);
    });

    it('should show used discount codes', async () => {
      addToCart(1, 1);
      checkout();
      addToCart(1, 1);
      checkout();
      addToCart(1, 1);
      checkout();

      addToCart(1, 1);
      checkout('SAVE10_3');

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.discountCodes[0].isUsed).toBe(true);
      expect(data.discountCodes[0].usedAt).not.toBeNull();
    });

    it('should calculate complex stats correctly', async () => {
      discountCodes.push({
        code: 'TEST10',
        isUsed: false,
        generatedAt: new Date().toISOString(),
        usedAt: null,
      });

      addToCart(1, 2);
      addToCart(2, 1);
      checkout();

      addToCart(3, 1);
      checkout('TEST10');

      addToCart(4, 2);
      addToCart(5, 1);
      checkout();

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalOrders).toBe(3);
      expect(data.totalItemsPurchased).toBe(7);
      expect(data.totalDiscountGiven).toBe(300);
      expect(data.totalPurchaseAmount).toBe(138700);
    });
  });
});
