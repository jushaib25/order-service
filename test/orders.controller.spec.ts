import { Test, TestingModule } from '@nestjs/testing';
import { OrdersController } from '../src/orders/orders.controller';
import { OrdersService } from '../src/orders/orders.service';

describe('OrdersController', () => {
  let controller: OrdersController;

  const ordersService = {
    createOrder: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: ordersService,
        },
      ],
    }).compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService.createOrder.mockReset();
  });

  it('returns the success envelope expected by the API', () => {
    const order = {
      id: 'order-1',
      studentId: 'student-1',
      items: [{ menuItemId: 'item-2', quantity: 1 }],
      total: 15,
    };

    ordersService.createOrder.mockReturnValue(order);

    expect(
      controller.createOrder({
        studentId: 'student-1',
        items: [{ menuItemId: 'item-2', quantity: 1 }],
      }),
    ).toEqual({
      success: true,
      data: order,
    });
  });
});
