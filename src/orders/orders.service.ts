import { Injectable, HttpStatus } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { CreateOrderDto } from './dto/create-order.dto';
import { menuItems, orders, parents, students } from './data/in-memory-store';
import { ORDER_ERROR_CODES } from './errors/order-error-codes';
import { OrderException } from './errors/order.exception';
import { Order } from './models/order.model';
import { OrderData } from './types/order-data.type';

@Injectable()
export class OrdersService {
  createOrder(dto: CreateOrderDto): Order {
    const orderData = this.validateOrderData(dto);
    const total = this.calculateTotal(orderData);
    const { parent } = orderData[0];

    if (!parent.hasSufficientBalance(total)) {
      throw new OrderException(
        ORDER_ERROR_CODES.INSUFFICIENT_BALANCE,
        'Insufficient wallet balance',
        HttpStatus.PAYMENT_REQUIRED
      );
    }

    return this.commitOrder(dto, parent, total);
  }

  private validateOrderData(dto: CreateOrderDto): OrderData[] {
    const student = students.find(
      (existingStudent) => existingStudent.id === dto.studentId,
    );

    if (!student) {
      throw new OrderException(
        ORDER_ERROR_CODES.STUDENT_NOT_FOUND,
        'Student not found',
        HttpStatus.NOT_FOUND
      );
    }

    const parent = parents.find(
      (existingParent) => existingParent.id === student.parentId,
    );

    if (!parent) {
      throw new OrderException(
        ORDER_ERROR_CODES.PARENT_NOT_FOUND,
        'Parent not found',
        HttpStatus.NOT_FOUND
      );
    }

    return dto.items.map((item) => {
      const menuItem = menuItems.find(
        (existingItem) => existingItem.id === item.menuItemId,
      );

      if (!menuItem) {
        throw new OrderException(
          ORDER_ERROR_CODES.MENU_ITEM_NOT_FOUND,
          `Menu item ${item.menuItemId} not found`,
          HttpStatus.NOT_FOUND
        );
      }

      if (!menuItem.available) {
        throw new OrderException(
          ORDER_ERROR_CODES.ITEM_UNAVAILABLE,
          `${menuItem.name} is unavailable`,
          HttpStatus.CONFLICT
        );
      }

      if (student.hasAllergenConflict(menuItem.allergens)) {
        throw new OrderException(
          ORDER_ERROR_CODES.ALLERGEN_CONFLICT,
          `${menuItem.name} contains allergens`,
          HttpStatus.CONFLICT
        );
      }

      return {
        student,
        parent,
        menuItem,
        quantity: item.quantity,
      };
    });
  }

  private calculateTotal(orderData: OrderData[]): number {
    return orderData.reduce(
      (total, item) => total + item.menuItem.price * item.quantity,
      0,
    );
  }

  // In a real application, where there is a database, this would be wrapped in a transaction to ensure atomicity
  private commitOrder(
    dto: CreateOrderDto,
    parent: OrderData['parent'],
    total: number,
  ): Order {
    try {
      parent.deduct(total);

      const order: Order = {
        id: randomUUID(),
        studentId: dto.studentId,
        items: dto.items.map((item) => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity,
        })),
        total,
      };

      orders.push(order);

      return order;
    } catch {
      parent.walletBalance += total;

      throw new OrderException(
        'ORDER_FAILED',
        'Order creation failed, rolled back',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
