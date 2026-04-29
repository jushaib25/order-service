export class Student {
  constructor(
    public id: string,
    public name: string,
    public allergens: string[],
    public parentId: string,
  ) {}

  hasAllergenConflict(itemAllergens: string[]): boolean {
    return itemAllergens.some((a) => this.allergens.includes(a));
  }
}