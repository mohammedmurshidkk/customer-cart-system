import { GET, POST, PATCH, DELETE } from '../route';
import { clearCart, addToCart } from '@/lib/store';

function createMockRequest(body: any) {
  return {
    json: async () => body,
  } as any;
}

describe('Cart API Routes', () => {
  beforeEach(() => {
    clearCart();
  });

  describe('GET /api/cart', () => {
    it('should return empty cart', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(0);
      expect(data.total).toBe(0);
    });

    it('should return cart with items', async () => {
      addToCart(1, 2);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(data.total).toBe(100000);
    });
  });

  describe('POST /api/cart', () => {
    it('should add item to cart', async () => {
      const request = createMockRequest({ productId: 1, quantity: 2 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].productId).toBe(1);
      expect(data.items[0].quantity).toBe(2);
    });

    it('should default to quantity 1', async () => {
      const request = createMockRequest({ productId: 2 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items[0].quantity).toBe(1);
    });

    it('should return 400 for missing productId', async () => {
      const request = createMockRequest({ quantity: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Product ID is required');
    });

    it('should return 400 for invalid productId', async () => {
      const request = createMockRequest({ productId: 999, quantity: 1 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Product not found');
    });

    it('should return 400 for invalid quantity', async () => {
      const request = createMockRequest({ productId: 1, quantity: 0 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Quantity must be at least 1');
    });
  });

  describe('PATCH /api/cart', () => {
    beforeEach(() => {
      addToCart(1, 2);
    });

    it('should update item quantity', async () => {
      const request = createMockRequest({ productId: 1, quantity: 5 });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items[0].quantity).toBe(5);
      expect(data.total).toBe(250000);
    });

    it('should return 400 for missing productId', async () => {
      const request = createMockRequest({ quantity: 3 });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Product ID and quantity are required');
    });

    it('should return 400 for missing quantity', async () => {
      const request = createMockRequest({ productId: 1 });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Product ID and quantity are required');
    });

    it('should return 400 for invalid quantity', async () => {
      const request = createMockRequest({ productId: 1, quantity: 0 });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Quantity must be at least 1');
    });

    it('should return 400 for non-existent item', async () => {
      const request = createMockRequest({ productId: 999, quantity: 1 });
      const response = await PATCH(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Item not found in cart');
    });
  });

  describe('DELETE /api/cart', () => {
    beforeEach(() => {
      addToCart(1, 2);
      addToCart(2, 1);
    });

    it('should remove item from cart', async () => {
      const request = createMockRequest({ productId: 1 });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.items).toHaveLength(1);
      expect(data.items[0].productId).toBe(2);
      expect(data.total).toBe(1000);
    });

    it('should return 400 for missing productId', async () => {
      const request = createMockRequest({});
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Product ID is required');
    });

    it('should return 400 for non-existent item', async () => {
      const request = createMockRequest({ productId: 999 });
      const response = await DELETE(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Item not found in cart');
    });
  });
});
