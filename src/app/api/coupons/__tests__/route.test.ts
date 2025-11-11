import { GET } from '../route';
import { discountCodes } from '@/lib/store';

describe('Coupons API Route', () => {
  beforeEach(() => {
    discountCodes.length = 0;
  });

  describe('GET /api/coupons', () => {
    it('should return empty array when no coupons exist', async () => {
      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(0);
    });

    it('should return only available coupons', async () => {
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
        },
        {
          code: 'SAVE10_9',
          isUsed: false,
          generatedAt: new Date().toISOString(),
          usedAt: null,
        }
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(2);
      expect(data[0].code).toBe('SAVE10_3');
      expect(data[1].code).toBe('SAVE10_9');
    });

    it('should not modify original discount codes', async () => {
      discountCodes.push({
        code: 'SAVE10_3',
        isUsed: false,
        generatedAt: new Date().toISOString(),
        usedAt: null,
      });

      const response = await GET();
      const data = await response.json();
      data[0].code = 'MODIFIED';

      expect(discountCodes[0].code).toBe('SAVE10_3');
    });

    it('should return all unused coupons', async () => {
      for (let i = 1; i <= 5; i++) {
        discountCodes.push({
          code: `SAVE10_${i * 3}`,
          isUsed: false,
          generatedAt: new Date().toISOString(),
          usedAt: null,
        });
      }

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveLength(5);
    });
  });
});
