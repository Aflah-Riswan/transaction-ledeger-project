# Transaction Ledger API Documentation

## Overview

The Transaction Ledger API is a RESTful service built with Node.js, Express, TypeScript, and MongoDB. It provides endpoints for creating accounts, managing balances, recording immutable credit/debit transactions, and retrieving paginated transaction history.

- **Base URL (Local)**: `http://localhost:5000/api`
- **Default Headers**:
  ```http
  Content-Type: application/json
  Accept: application/json
  ```

---

## Global Design Conventions

### 1. Money Representation
- All amounts and balances are represented as **positive integers in minor currency units** (e.g., `1000` = $10.00 or ₹10.00).
- Floating-point numbers, negative numbers, and numbers with leading zeros (e.g., `"099"`) are rejected.

### 2. Standard Response Envelope
All API responses return a consistent JSON envelope:

**Success Response Format:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response Format:**
```json
{
  "success": false,
  "message": "Human-readable error explanation."
}
```

### 3. HTTP Status Codes
| Status Code | Meaning | Description |
| :--- | :--- | :--- |
| `200 OK` | Success | The request succeeded and data is returned. |
| `201 Created` | Created | A new resource (account or transaction) was successfully created. |
| `400 Bad Request` | Client Error | Validation failed (missing field, negative amount, insufficient funds). |
| `404 Not Found` | Not Found | The requested account or route does not exist. |
| `409 Conflict` | Conflict | Duplicate `referenceId` for the specified account. |
| `500 Server Error` | Server Error | Internal server error. |

---

## Endpoint Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health check to verify service status. |
| `POST` | `/api/accounts` | Create a new ledger account. |
| `GET` | `/api/accounts` | Retrieve all existing accounts. |
| `GET` | `/api/accounts/:accountId/balance` | Get the real-time balance of an account. |
| `POST` | `/api/accounts/:accountId/transactions` | Post a credit or debit transaction. |
| `GET` | `/api/accounts/:accountId/transactions` | Get paginated transaction history with type filtering. |

---

## Endpoints

### 1. Health Check
Checks if the backend API service is running.

- **URL**: `/api/health`
- **Method**: `GET`
- **Authentication**: None

#### Response (`200 OK`)
```json
{
  "success": true,
  "message": "server is healthy"
}
```

---

### 2. Create Account
Creates a new account with an initial balance of zero.

- **URL**: `/api/accounts`
- **Method**: `POST`

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | **Yes** | Non-empty name of the account holder or entity. |

```json
{
  "name": "Alice Johnson"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "6720e183794e77218efab101",
    "name": "Alice Johnson",
    "balance": 0,
    "createdAt": "2026-10-29T10:15:30.123Z"
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Missing or empty name):
  ```json
  {
    "success": false,
    "message": "Account name is required and cannot be empty."
  }
  ```

---

### 3. List All Accounts
Returns a list of all existing accounts.

- **URL**: `/api/accounts`
- **Method**: `GET`

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": [
    {
      "id": "6720e183794e77218efab101",
      "name": "Alice Johnson",
      "balance": 5000,
      "createdAt": "2026-10-29T10:15:30.123Z"
    },
    {
      "id": "6720e183794e77218efab102",
      "name": "Bob Smith",
      "balance": 0,
      "createdAt": "2026-10-29T10:20:00.000Z"
    }
  ]
}
```

---

### 4. Get Account Balance
Retrieves the current balance for a specified account.

- **URL**: `/api/accounts/:accountId/balance`
- **Method**: `GET`

#### URL Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `accountId` | string | 24-character hexadecimal MongoDB `ObjectId`. |

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "accountId": "6720e183794e77218efab101",
    "balance": 5000
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Malformed account ID):
  ```json
  {
    "success": false,
    "message": "Invalid account ID format. Must be a 24-character hex string."
  }
  ```
- **`404 Not Found`** (Account not found):
  ```json
  {
    "success": false,
    "message": "Account with ID 6720e183794e77218efab999 was not found."
  }
  ```

---

### 5. Add Transaction
Applies a credit or debit entry to an account.

- **URL**: `/api/accounts/:accountId/transactions`
- **Method**: `POST`

#### URL Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `accountId` | string | 24-character hexadecimal MongoDB `ObjectId`. |

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | **Yes** | Transaction type: `"credit"` or `"debit"`. |
| `amount` | integer | **Yes** | Positive integer greater than zero (`> 0`) in minor units. |
| `referenceId` | string | **Yes** | Unique idempotency key/reference for this account. |
| `description` | string | No | Optional note (defaults to empty string). |

```json
{
  "type": "credit",
  "amount": 2500,
  "referenceId": "PAY-INV-2026-001",
  "description": "Initial invoice payment"
}
```

#### Response (`201 Created`)
```json
{
  "success": true,
  "data": {
    "id": "6720e290794e77218efab105",
    "accountId": "6720e183794e77218efab101",
    "type": "credit",
    "amount": 2500,
    "description": "Initial invoice payment",
    "referenceId": "PAY-INV-2026-001",
    "createdAt": "2026-10-29T10:30:15.542Z",
    "newBalance": 2500
  }
}
```

#### Error Responses
- **`400 Bad Request`** (Insufficient balance for debit):
  ```json
  {
    "success": false,
    "message": "Insufficient funds: current balance is 1000, requested debit is 2500."
  }
  ```
- **`400 Bad Request`** (Invalid amount / decimals / zero):
  ```json
  {
    "success": false,
    "message": "Amount must be a positive integer without leading zeros."
  }
  ```
- **`409 Conflict`** (Duplicate reference ID):
  ```json
  {
    "success": false,
    "message": "A transaction with this reference ID already exists for this account."
  }
  ```

---

### 6. Get Transaction History
Retrieves paginated transactions for an account in reverse chronological order.

- **URL**: `/api/accounts/:accountId/transactions`
- **Method**: `GET`

#### URL Parameters
| Parameter | Type | Description |
| :--- | :--- | :--- |
| `accountId` | string | 24-character hexadecimal MongoDB `ObjectId`. |

#### Query Parameters
| Parameter | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `type` | string | *all* | Optional filter: `"credit"` or `"debit"`. |
| `page` | integer | `1` | Page number to fetch. |
| `limit` | integer | `10` | Records per page (maximum `100`). |

**Example Query:**
```http
GET /api/accounts/6720e183794e77218efab101/transactions?type=credit&page=1&limit=5
```

#### Response (`200 OK`)
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "6720e290794e77218efab105",
        "accountId": "6720e183794e77218efab101",
        "type": "credit",
        "amount": 2500,
        "description": "Initial invoice payment",
        "referenceId": "PAY-INV-2026-001",
        "createdAt": "2026-10-29T10:30:15.542Z"
      }
    ],
    "page": 1,
    "limit": 5,
    "totalRecords": 1,
    "totalPages": 1
  }
}
```

---

## Common Error Codes Summary

| Code | Reason | Cause |
| :--- | :--- | :--- |
| `400` | `ValidationError` | Malformed ID, invalid amount format, missing required body fields. |
| `400` | `InsufficientBalanceError` | Debit requested exceeds current available balance. |
| `404` | `AccountNotFoundError` | Account ID is valid format but does not match any record. |
| `404` | `RouteNotFound` | The requested API route does not exist. |
| `409` | `DuplicateReferenceError` | `referenceId` has already been recorded for this account. |
| `500` | `InternalServerError` | Uncaught server exception (logged internally, hides stack trace). |
