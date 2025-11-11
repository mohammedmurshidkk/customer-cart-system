import {
  cart,
  orders,
  discountCodes,
  calculateCartTotal,
  calculateDiscount,
  addToCart,
  getCart,
  updateCartQuantity,
  removeFromCart,
  clearCart,
  checkout,
  getAvailableCoupons,
  getAdminStats,
} from '../store';

describe('Store Functions', () => {
  beforeEach(() => {
    clearCart();
    orders.length = 0;
    discountCodes.length = 0;
  });

  describe('calculateCartTotal', () => {
    it('should return 0 for empty cart', () => {
      expect(calculateCartTotal()).toBe(0);
    });

    it('should calculate total correctly for single item', () => {
      addToCart(1, 2);
      expect(calculateCartTotal()).toBe(100000);
    });

    it('should calculate total correctly for multiple items', () => {
      addToCart(1, 1);
      addToCart(2, 2);
      expect(calculateCartTotal()).toBe(52000);
    });
  });

  describe('calculateDiscount', () => {
    it('should calculate 10% discount correctly', () => {
      expect(calculateDiscount(10000)).toBe(1000);
    });

    it('should round discount correctly', () => {
      expect(calculateDiscount(1555)).toBe(156);
    });

    it('should handle custom discount percentage', () => {
      expect(calculateDiscount(10000, 20)).toBe(2000);
    });
  });

  describe('addToCart', () => {
    it('should add new item to cart', () => {
      const result = addToCart(1, 1);
      expect(result.success).toBe(true);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(1);
      expect(cart.items[0].quantity).toBe(1);
    });

    it('should update quantity if item already exists', () => {
      addToCart(1, 2);
      addToCart(1, 3);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].quantity).toBe(5);
    });

    it('should fail for invalid product ID', () => {
      const result = addToCart(999);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Product not found');
    });

    it('should fail for quantity less than 1', () => {
      const result = addToCart(1, 0);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Quantity must be at least 1');
    });

    it('should update cart total', () => {
      addToCart(1, 2);
      expect(cart.total).toBe(100000);
    });
  });

  describe('getCart', () => {
    it('should return cart copy', () => {
      addToCart(1, 1);
      const cartCopy = getCart();
      expect(cartCopy.items).toEqual(cart.items);
      expect(cartCopy).not.toBe(cart);
    });
  });

  describe('updateCartQuantity', () => {
    beforeEach(() => {
      addToCart(1, 2);
    });

    it('should update item quantity', () => {
      const result = updateCartQuantity(1, 5);
      expect(result.success).toBe(true);
      expect(cart.items[0].quantity).toBe(5);
    });

    it('should update cart total', () => {
      updateCartQuantity(1, 3);
      expect(cart.total).toBe(150000);
    });

    it('should fail for non-existent item', () => {
      const result = updateCartQuantity(999, 1);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Item not found in cart');
    });

    it('should fail for quantity less than 1', () => {
      const result = updateCartQuantity(1, 0);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Quantity must be at least 1');
    });
  });

  describe('removeFromCart', () => {
    beforeEach(() => {
      addToCart(1, 2);
      addToCart(2, 1);
    });

    it('should remove item from cart', () => {
      const result = removeFromCart(1);
      expect(result.success).toBe(true);
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].productId).toBe(2);
    });

    it('should update cart total', () => {
      removeFromCart(1);
      expect(cart.total).toBe(1000);
    });

    it('should fail for non-existent item', () => {
      const result = removeFromCart(999);
      expect(result.success).toBe(false);
      expect(result.message).toBe('Item not found in cart');
    });
  });

  describe('clearCart', () => {
    it('should clear all items', () => {
      addToCart(1, 2);
      addToCart(2, 1);
      clearCart();
      expect(cart.items).toHaveLength(0);
      expect(cart.total).toBe(0);
    });
  });

  describe('checkout', () => {
    beforeEach(() => {
      addToCart(1, 1);
    });

    it('should fail for empty cart', () => {
      clearCart();
      const result = checkout();
      expect(result.success).toBe(false);
      expect(result.message).toBe('Cart is empty');
    });

    it('should create order without discount', () => {
      const result = checkout();
      expect(result.success).toBe(true);
      expect(result.order).toBeDefined();
      expect(result.order!.subtotal).toBe(50000);
      expect(result.order!.discount).toBe(0);
      expect(result.order!.total).toBe(50000);
    });

    it('should clear cart after checkout', () => {
      checkout();
      expect(cart.items).toHaveLength(0);
    });

    it('should add order to orders array', () => {
      checkout();
      expect(orders).toHaveLength(1);
    });

    it('should generate discount code on 3rd order', () => {
      checkout();
      addToCart(1, 1);
      checkout();
      addToCart(1, 1);
      const result = checkout();

      expect(result.newDiscountCode).toBe('SAVE10_3');
      expect(discountCodes).toHaveLength(1);
      expect(discountCodes[0].code).toBe('SAVE10_3');
      expect(discountCodes[0].isUsed).toBe(false);
    });

    it('should apply valid discount code', () => {
      discountCodes.push({
        code: 'TEST10',
        isUsed: false,
        generatedAt: new Date().toISOString(),
        usedAt: null,
      });

      const result = checkout('TEST10');
      expect(result.success).toBe(true);
      expect(result.order!.discount).toBe(5000);
      expect(result.order!.total).toBe(45000);
      expect(discountCodes[0].isUsed).toBe(true);
    });

    it('should fail for invalid discount code', () => {
      const result = checkout('INVALID');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid or already used discount code');
    });

    it('should fail for already used discount code', () => {
      discountCodes.push({
        code: 'USED10',
        isUsed: true,
        generatedAt: new Date().toISOString(),
        usedAt: new Date().toISOString(),
      });

      const result = checkout('USED10');
      expect(result.success).toBe(false);
      expect(result.message).toBe('Invalid or already used discount code');
    });
  });

  describe('getAvailableCoupons', () => {
    it('should return only unused coupons', () => {
      discountCodes.push(
        {
          code: 'SAVE10_3',
          isUsed: false,
          generatedAt: new Date().toISOString(),
          usedAt: null,
        },
        {
          code: 'SAVE10_6',
          isUsed: true,
          generatedAt: new Date().toISOString(),
          usedAt: new Date().toISOString(),
        }
      );

      const available = getAvailableCoupons();
      expect(available).toHaveLength(1);
      expect(available[0].code).toBe('SAVE10_3');
    });

    it('should return empty array when no coupons available', () => {
      const available = getAvailableCoupons();
      expect(available).toHaveLength(0);
    });
  });

  describe('getAdminStats', () => {
    it('should return correct stats for no orders', () => {
      const stats = getAdminStats();
      expect(stats.totalOrders).toBe(0);
      expect(stats.totalItemsPurchased).toBe(0);
      expect(stats.totalPurchaseAmount).toBe(0);
      expect(stats.totalDiscountGiven).toBe(0);
    });

    it('should calculate stats correctly', () => {
      addToCart(1, 2);
      addToCart(2, 1);
      checkout();

      addToCart(3, 1);
      checkout();

      const stats = getAdminStats();
      expect(stats.totalOrders).toBe(2);
      expect(stats.totalItemsPurchased).toBe(4);
      expect(stats.totalPurchaseAmount).toBe(104000);
      expect(stats.totalDiscountGiven).toBe(0);
    });

    it('should include discount in stats', () => {
      discountCodes.push({
        code: 'TEST10',
        isUsed: false,
        generatedAt: new Date().toISOString(),
        usedAt: null,
      });

      addToCart(1, 1);
      checkout('TEST10');

      const stats = getAdminStats();
      expect(stats.totalDiscountGiven).toBe(5000);
      expect(stats.totalPurchaseAmount).toBe(45000);
    });
  });
});
