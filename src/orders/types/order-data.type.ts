import { MenuItem } from '../models/menu-item.model';
import { Parent } from '../models/parent.model';
import { Student } from '../models/student.model';

export type OrderData = {
  student: Student;
  parent: Parent;
  menuItem: MenuItem;
  quantity: number;
};
