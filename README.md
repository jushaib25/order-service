# Flexischools Technical Test

This repository contains a NestJS implementation for Part 1 of the test.

## Run locally

```bash
npm install
npm run start:dev
```

The API starts on `http://localhost:3000`.

## Implemented Part 1 behavior

`POST /orders` creates an order against the in-memory seed data and enforces all required business rules:

- Rejects when the student does not exist
- Rejects when the parent does not exist
- Rejects when a menu item does not exist
- Rejects when a menu item is unavailable
- Rejects when a menu item conflicts with the student's allergens
- Rejects when the parent wallet balance is insufficient
- Calculates the order total correctly
- Deducts the wallet balance after validation succeeds
- Returns a success response with the created order

Example request:

```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": "student-1",
    "items": [
      { "menuItemId": "item-2", "quantity": 2 }
    ]
  }'
```

Example success response:

```json
{
  "success": true,
  "data": {
    "id": "generated-order-id",
    "studentId": "student-1",
    "items": [{ "menuItemId": "item-2", "quantity": 2 }],
    "total": 30
  }
}
```

Example business error:

```json
{
  "code": "INSUFFICIENT_BALANCE",
  "message": "Insufficient wallet balance"
}
```

## Seed data

- Parent: `parent-1`, wallet balance `50`
- Student: `student-1`, allergen `nuts`, parent `parent-1`
- Menu item: `item-1`, `Peanut Butter Sandwich`, price `10`, allergen `nuts`, available
- Menu item: `item-2`, `Chicken Wrap`, price `15`, no allergens, available
- Menu item: `item-3`, `Unavailable Juice`, price `5`, unavailable

## Design decisions and trade-offs

- In-memory arrays are used to keep the solution small and aligned with the assignment allowance for hardcoded data.
- Validation is split into a validation phase and a commit phase so wallet deduction only happens after all business rules pass.
- The API returns a consistent error structure for domain errors through a dedicated `OrderException`.

## Transaction consistency note

This solution validates first and mutating state only during the commit step. In a real system, order creation and wallet deduction should be wrapped in a database transaction so both operations either commit together or roll back together.


## Assumptions

- `walletBalance` is a stored balance, not a real payment method.
- Multiple order lines for the same menu item are allowed and are summed as provided.


## Part 2: Production issue analysis

### What could cause this issue?

- Lack of atomicity can be the cause where the order is created, but wallet deduction fails.
- Multiple requests read the same wallet balance simultaneously and pass validations, leading to overspending due to a race condition.
- Service crashes or timeouts after order creation and before wallet deduction.

### How would you debug it?

- Trace the entire request lifecycle and check logs for order creation, wallet deduction, and the response returned for the particular request.
- Check if there are any duplicate requests from the API gateway or logs.
- Check if multiple orders were placed simultaneously for the same parent.
- Check metrics, if configured, to find out which flow was triggered.
- Try to reproduce the issue locally.

### How would you prevent it in the future?

- Use database transactions to ensure order creation and wallet deduction are atomic.
- Apply row-level locking for concurrency control.
- Prevent duplicate orders from retries.
- Add metrics for monitoring and alerting.
- Add clear logs to help with debugging.

