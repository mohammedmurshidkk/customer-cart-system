import { POST } from '../route';
import { GET as CartGET } from '../../cart/route';
import { clearCart, addToCart, discountCodes, orders } from '@/lib/store';

function createMockRequest(body: any) {
  return {
    json: async () => body,
  } as any;
}

describe('Checkout API Route', () => {
  beforeEach(() => {
    clearCart();
    orders.length = 0;
    discountCodes.length = 0;
  });

  describe('POST /api/checkout', () => {
    it('should checkout without discount code', async () => {
      addToCart(1, 1);

      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.order).toBeDefined();
      expect(data.order.subtotal).toBe(50000);
      expect(data.order.discount).toBe(0);
      expect(data.order.total).toBe(50000);
      expect(data.message).toBe('Order placed successfully!');
    });

    it('should return 400 for empty cart', async () => {
      const request = createMockRequest({});
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Cart is empty');
    });

    it('should apply valid discount code', async () => {
      discountCodes.push({
        code: 'SAVE10_3',
        isUsed: false,
        generatedAt: new Date().toISOString(),
        usedAt: null,
      });

      addToCart(1, 1);

      const request = createMockRequest({ discountCode: 'SAVE10_3' });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.order.discount).toBe(5000);
      expect(data.order.total).toBe(45000);
      expect(data.order.discountCode).toBe('SAVE10_3');
    });

    it('should return 400 for invalid discount code', async () => {
      addToCart(1, 1);

      const request = createMockRequest({ discountCode: 'INVALID' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid or already used discount code');
    });

    it('should return 400 for already used discount code', async () => {
      discountCodes.push({
        code: 'USED10',
        isUsed: true,
        generatedAt: new Date().toISOString(),
        usedAt: new Date().toISOString(),
      });

      addToCart(1, 1);

      const request = createMockRequest({ discountCode: 'USED10' });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Invalid or already used discount code');
    });

    it('should generate discount code on 3rd order', async () => {
      addToCart(1, 1);
      await POST(createMockRequest({}));

      addToCart(2, 1);
      await POST(createMockRequest({}));

      addToCart(3, 1);
      const response = await POST(createMockRequest({}));

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.newDiscountCode).toBe('SAVE10_3');
      expect(data.message).toContain('SAVE10_3');
    });

    it('should not generate discount code on non-3rd order', async () => {
      addToCart(1, 1);
      const response = await POST(createMockRequest({}));

      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.newDiscountCode).toBeUndefined();
      expect(data.message).toBe('Order placed successfully!');
    });

    it('should clear cart after checkout', async () => {
      addToCart(1, 2);
      addToCart(2, 1);

      await POST(createMockRequest({}));

      const cartResponse = await CartGET();
      const cart = await cartResponse.json();

      expect(cart.items).toHaveLength(0);
    });
  });
});
