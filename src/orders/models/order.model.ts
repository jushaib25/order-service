export type OrderItem = {
  menuItemId: string;
  quantity: number;
};

export type Order = {
  id: string;
  studentId: string;
  items: OrderItem[];
  total: number;
};
