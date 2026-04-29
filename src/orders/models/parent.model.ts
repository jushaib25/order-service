export class Parent {
  constructor(
    public id: string,
    public name: string,
    public walletBalance: number,
  ) {}

  hasSufficientBalance(amount: number): boolean {
    return this.walletBalance >= amount;
  }

  deduct(amount: number) {
    this.walletBalance -= amount;
  }
}