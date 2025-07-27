# API Documentation

## Base URL
```
http://localhost:8080
```

## Authentication
This API does not require authentication. It's designed for personal use with a single user.

## Content-Type
All requests and responses use `application/json` content type.

## Error Handling

### Error Response Format
```json
{
  "timestamp": "2025-07-27T10:30:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/expenses"
}
```

### HTTP Status Codes
- `200 OK` - Request successful
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `404 Not Found` - Resource not found
- `500 Internal Server Error` - Server error

## Endpoints

### 1. Get All Expenses
Retrieve all expenses with optional filtering.

**Endpoint:** `GET /api/expenses`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `category` | String | No | Filter by expense category |
| `startDate` | String (YYYY-MM-DD) | No | Filter expenses from this date |
| `endDate` | String (YYYY-MM-DD) | No | Filter expenses until this date |

**Example Requests:**
```bash
# Get all expenses
GET /api/expenses

# Filter by category
GET /api/expenses?category=FOOD

# Filter by date range
GET /api/expenses?startDate=2025-07-01&endDate=2025-07-31

# Combined filters
GET /api/expenses?category=TRANSPORTATION&startDate=2025-07-01
```

**Response:**
```json
[
  {
    "id": 1,
    "amount": 25.50,
    "category": "FOOD",
    "description": "Lunch at restaurant",
    "date": "2025-07-27",
    "createdAt": "2025-07-27T10:30:00"
  },
  {
    "id": 2,
    "amount": 45.80,
    "category": "TRANSPORTATION",
    "description": "Gas fill-up",
    "date": "2025-07-26",
    "createdAt": "2025-07-26T17:45:00"
  }
]
```

### 2. Create New Expense
Add a new expense to the system.

**Endpoint:** `POST /api/expenses`

**Request Body:**
```json
{
  "amount": 25.50,
  "category": "FOOD",
  "description": "Lunch at restaurant",
  "date": "2025-07-27"
}
```

**Field Validation:**
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `amount` | BigDecimal | Yes | Must be positive, max 2 decimal places |
| `category` | String | Yes | Must be valid enum value |
| `description` | String | No | Max 255 characters |
| `date` | String (YYYY-MM-DD) | Yes | Valid date format |

**Valid Categories:**
- `FOOD`
- `TRANSPORTATION`
- `ENTERTAINMENT`
- `HEALTHCARE`
- `SHOPPING`
- `BILLS`
- `OTHER`

**Response:** `201 Created`
```json
{
  "id": 1,
  "amount": 25.50,
  "category": "FOOD",
  "description": "Lunch at restaurant",
  "date": "2025-07-27",
  "createdAt": "2025-07-27T10:30:00"
}
```

**Error Examples:**
```json
// Invalid amount (negative)
{
  "timestamp": "2025-07-27T10:30:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Amount must be positive",
  "path": "/api/expenses"
}

// Invalid category
{
  "timestamp": "2025-07-27T10:30:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Invalid category. Must be one of: FOOD, TRANSPORTATION, ENTERTAINMENT, HEALTHCARE, SHOPPING, BILLS, OTHER",
  "path": "/api/expenses"
}

// Missing required field
{
  "timestamp": "2025-07-27T10:30:00.000+00:00",
  "status": 400,
  "error": "Bad Request",
  "message": "Amount is required",
  "path": "/api/expenses"
}
```

### 3. Get Expense by ID
Retrieve a specific expense by its ID.

**Endpoint:** `GET /api/expenses/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Long | Yes | Expense ID |

**Example Request:**
```bash
GET /api/expenses/1
```

**Response:** `200 OK`
```json
{
  "id": 1,
  "amount": 25.50,
  "category": "FOOD",
  "description": "Lunch at restaurant",
  "date": "2025-07-27",
  "createdAt": "2025-07-27T10:30:00"
}
```

**Error Response:** `404 Not Found`
```json
{
  "timestamp": "2025-07-27T10:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Expense not found with id: 999",
  "path": "/api/expenses/999"
}
```

### 4. Delete Expense
Remove an expense from the system.

**Endpoint:** `DELETE /api/expenses/{id}`

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | Long | Yes | Expense ID to delete |

**Example Request:**
```bash
DELETE /api/expenses/1
```

**Response:** `200 OK`
```json
{
  "message": "Expense deleted successfully",
  "id": 1
}
```

**Error Response:** `404 Not Found`
```json
{
  "timestamp": "2025-07-27T10:30:00.000+00:00",
  "status": 404,
  "error": "Not Found",
  "message": "Expense not found with id: 999",
  "path": "/api/expenses/999"
}
```

### 5. Get Monthly Summary
Retrieve expense summary for the current month.

**Endpoint:** `GET /api/expenses/summary`

**Example Request:**
```bash
GET /api/expenses/summary
```

**Response:** `200 OK`
```json
{
  "currentMonth": "2025-07",
  "totalExpenses": 1250.75,
  "expenseCount": 45,
  "averagePerDay": 40.35,
  "highestExpense": {
    "id": 15,
    "amount": 150.00,
    "category": "SHOPPING",
    "description": "New laptop accessories",
    "date": "2025-07-15"
  },
  "mostExpensiveDay": "2025-07-15",
  "dailyAverage": 40.35
}
```

### 6. Get Category Summary
Retrieve expense totals grouped by category.

**Endpoint:** `GET /api/expenses/category-summary`

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `month` | String (YYYY-MM) | No | Filter by specific month (default: current month) |

**Example Requests:**
```bash
# Current month category summary
GET /api/expenses/category-summary

# Specific month category summary
GET /api/expenses/category-summary?month=2025-06
```

**Response:** `200 OK`
```json
{
  "month": "2025-07",
  "totalAmount": 1250.75,
  "categoryBreakdown": [
    {
      "category": "FOOD",
      "totalAmount": 425.50,
      "expenseCount": 18,
      "percentage": 34.0,
      "averageExpense": 23.64
    },
    {
      "category": "TRANSPORTATION",
      "totalAmount": 285.30,
      "expenseCount": 12,
      "percentage": 22.8,
      "averageExpense": 23.78
    },
    {
      "category": "ENTERTAINMENT",
      "totalAmount": 195.75,
      "expenseCount": 8,
      "percentage": 15.7,
      "averageExpense": 24.47
    },
    {
      "category": "HEALTHCARE",
      "totalAmount": 125.40,
      "expenseCount": 4,
      "percentage": 10.0,
      "averageExpense": 31.35
    },
    {
      "category": "SHOPPING",
      "totalAmount": 148.90,
      "expenseCount": 5,
      "percentage": 11.9,
      "averageExpense": 29.78
    },
    {
      "category": "BILLS",
      "totalAmount": 69.90,
      "expenseCount": 3,
      "percentage": 5.6,
      "averageExpense": 23.30
    }
  ],
  "topCategory": "FOOD",
  "leastExpensiveCategory": "BILLS"
}
```

## CORS Configuration

The API is configured to accept requests from the React frontend:

```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Accept
```

## Database Schema Reference

### Expense Entity
```sql
CREATE TABLE expenses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    category VARCHAR(20) NOT NULL,
    description VARCHAR(255),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Category Constraints
```sql
ALTER TABLE expenses ADD CONSTRAINT category_check 
CHECK (category IN ('FOOD', 'TRANSPORTATION', 'ENTERTAINMENT', 
                   'HEALTHCARE', 'SHOPPING', 'BILLS', 'OTHER'));
```

## Testing the API

### Using curl

**Create an expense:**
```bash
curl -X POST http://localhost:8080/api/expenses \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 25.50,
    "category": "FOOD",
    "description": "Lunch at restaurant",
    "date": "2025-07-27"
  }'
```

**Get all expenses:**
```bash
curl -X GET http://localhost:8080/api/expenses
```

**Get category summary:**
```bash
curl -X GET http://localhost:8080/api/expenses/category-summary
```

**Delete an expense:**
```bash
curl -X DELETE http://localhost:8080/api/expenses/1
```

### Using Postman

Import the following collection to test all endpoints:

1. **Create Collection:** "Personal Expense Tracker API"
2. **Set Base URL:** `http://localhost:8080`
3. **Add requests** for each endpoint listed above
4. **Test different scenarios** including error cases

## Rate Limiting

Currently, no rate limiting is implemented as this is designed for personal use. For production deployment, consider adding rate limiting middleware.

## API Versioning

The current API version is `v1`. Future versions will be prefixed as `/api/v2/expenses`.

## Health Check

**Endpoint:** `GET /actuator/health` (if Spring Boot Actuator is enabled)

```json
{
  "status": "UP"
}
```