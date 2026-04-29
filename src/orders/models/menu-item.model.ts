export class MenuItem {
  constructor(
    public id: string,
    public name: string,
    public price: number,
    public allergens: string[],
    public available: boolean,
  ) {}
}