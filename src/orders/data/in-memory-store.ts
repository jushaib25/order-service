import { Parent } from '../models/parent.model';
import { Student } from '../models/student.model';
import { MenuItem } from '../models/menu-item.model';
import { Order } from '../models/order.model';

const createParents = (): Parent[] => [new Parent('parent-1', 'John Parent', 50)];

const createStudents = (): Student[] => [
  new Student('student-1', 'Alex Student', ['nuts'], 'parent-1'),
];

const createMenuItems = (): MenuItem[] => [
  new MenuItem('item-1', 'Peanut Butter Sandwich', 10, ['nuts'], true),
  new MenuItem('item-2', 'Chicken Wrap', 15, [], true),
  new MenuItem('item-3', 'Juice', 5, [], false),
];

export let parents: Parent[] = createParents();
export let students: Student[] = createStudents();
export let menuItems: MenuItem[] = createMenuItems();
export let orders: Order[] = [];

export const resetStore = (): void => {
  parents = createParents();
  students = createStudents();
  menuItems = createMenuItems();
  orders = [];
};
