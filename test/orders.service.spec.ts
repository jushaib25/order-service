import { Test, TestingModule } from '@nestjs/testing';
import { orders, parents, resetStore } from '../src/orders/data/in-memory-store';
import { ORDER_ERROR_CODES } from '../src/orders/errors/order-error-codes';
import { OrderException } from '../src/orders/errors/order.exception';
import { OrdersService } from '../src/orders/orders.service';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    resetStore();

    const module: TestingModule = await Test.createTestingModule({
      providers: [OrdersService],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('creates an order, calculates the total, and deducts the parent balance', () => {
    const order = service.createOrder({
      studentId: 'student-1',
      items: [{ menuItemId: 'item-2', quantity: 2 }],
    });

    expect(order.total).toBe(30);
    expect(order.items).toEqual([{ menuItemId: 'item-2', quantity: 2 }]);
    expect(parents[0].walletBalance).toBe(20);
    expect(orders).toHaveLength(1);
  });

  it('rejects an order when the wallet balance is insufficient', () => {
    expect(() =>
      service.createOrder({
        studentId: 'student-1',
        items: [{ menuItemId: 'item-2', quantity: 4 }],
      }),
    ).toThrow(
      new OrderException(
        ORDER_ERROR_CODES.INSUFFICIENT_BALANCE,
        'Insufficient wallet balance',
      ),
    );

    expect(parents[0].walletBalance).toBe(50);
    expect(orders).toHaveLength(0);
  });

  it('rejects an order when an item contains a student allergen', () => {
    expect(() =>
      service.createOrder({
        studentId: 'student-1',
        items: [{ menuItemId: 'item-1', quantity: 1 }],
      }),
    ).toThrow(
      new OrderException(
        ORDER_ERROR_CODES.ALLERGEN_CONFLICT,
        'Peanut Butter Sandwich contains allergens',
      ),
    );

    expect(parents[0].walletBalance).toBe(50);
    expect(orders).toHaveLength(0);
  });

  it('rejects an order when an item is unavailable', () => {
    expect(() =>
      service.createOrder({
        studentId: 'student-1',
        items: [{ menuItemId: 'item-3', quantity: 1 }],
      }),
    ).toThrow(
      new OrderException(
        ORDER_ERROR_CODES.ITEM_UNAVAILABLE,
        'Juice is unavailable',
      ),
    );

    expect(parents[0].walletBalance).toBe(50);
    expect(orders).toHaveLength(0);
  });
});
