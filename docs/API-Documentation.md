# Personal Expense Tracker - API Documentation

## 🔐 Phase 4: Custom Authentication System API

### **Base URL**
- **Development:** `http://localhost:8080`
- **Production:** `https://your-domain.com`

### **Enterprise Package Structure**
- **Controllers:** `com.expensetracker.web.controller.*`
- **Services:** `com.expensetracker.backend.service.*`
- **DTOs:** `com.expensetracker.mapper.*`
- **Filters:** `com.expensetracker.web.filters.*`
- **Exceptions:** `com.expensetracker.web.exception.*` (4xx) | `com.expensetracker.backend.exception.*` (5xx)

---

## 🔑 Authentication Endpoints

### 1. **Login User**
```http
POST /api/auth/login
```

**Controller:** `com.expensetracker.web.controller.AuthController`  
**Service:** `com.expensetracker.backend.service.CustomAuthService`  
**Description:** Authenticate user with email/password via custom Material-UI interface

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "demo@expensetracker.com",
  "password": "DemoPassword123!",
  "rememberMe": false
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cC...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cC...",
  "expiresIn": 1800,
  "user": {
    "id": "demo-user-id",
    "email": "demo@expensetracker.com",
    "firstName": "Demo",
    "lastName": "User",
    "displayName": "Demo User"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Authentication failed: Invalid credentials"
}
```

**Security Features:**
- ✅ Session persistence via HTTP session
- ✅ ROLE_USER authority assignment
- ✅ Optional Remember Me cookies (30-day refresh tokens)
- ✅ Keycloak integration via Resource Owner Password Flow

---

### 2. **Register User**
```http
POST /api/auth/signup
```

**Description:** Register new user account via Keycloak Admin API

**Request Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "john.doe@example.com",
  "password": "SecurePassword123!"
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Authentication successful",
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cC...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cC...",
  "expiresIn": 1800,
  "user": {
    "id": "new-user-id",
    "email": "john.doe@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "displayName": "John Doe"
  }
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Registration failed: Email already exists"
}
```

---

### 3. **Get Current User**
```http
GET /api/auth/user
```

**Description:** Retrieve authenticated user's profile information

**Request Headers:**
```
Cookie: JSESSIONID=ABC123...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "User retrieved successfully",
  "id": "demo-user-id",
  "email": "demo@expensetracker.com",
  "firstName": "Demo",
  "lastName": "User",
  "displayName": "Demo User",
  "emailVerified": true
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Failed to get user info: User not authenticated"
}
```

---

### 4. **Validate Token**
```http
POST /api/auth/validate
```

**Description:** Validate current authentication status

**Request Headers:**
```
Cookie: JSESSIONID=ABC123...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token is valid"
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Token validation failed: Authentication required"
}
```

---

### 5. **Refresh Token**
```http
POST /api/auth/refresh
```

**Description:** Refresh access token using stored refresh token cookie

**Request Headers:**
```
Cookie: refresh_token=eyJhbGciOiJIUzI1NiIsInR5cC...
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Token refreshed successfully",
  "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cC...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cC...",
  "expiresIn": 1800
}
```

**Error Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Token refresh failed: No refresh token available"
}
```

---

### 6. **Nuclear Logout**
```http
GET /api/auth/nuclear-logout
```

**Description:** Complete logout with Keycloak session termination and cookie cleanup

**Request Headers:**
```
Cookie: JSESSIONID=ABC123...
```

**Response:** HTTP 302 Redirect to frontend login page

**Features:**
- ✅ Terminates Keycloak session via Admin API
- ✅ Clears Spring Security context
- ✅ Removes all authentication cookies
- ✅ Invalidates HTTP session
- ✅ Redirects to Keycloak logout then back to frontend

---

## 📊 Expense Management Endpoints

### 7. **Get Expenses** (Requires Authentication)
```http
GET /api/expenses?page=0&size=10
```

**Controller:** `com.expensetracker.web.controller.ExpenseController`  
**Service:** `com.expensetracker.backend.service.ExpenseService`  
**Description:** Retrieve paginated expense list for authenticated user

**Request Headers:**
```
Cookie: JSESSIONID=ABC123...
```

**Query Parameters:**
- `page` (optional): Page number (default: 0)
- `size` (optional): Page size (default: 10)

**Success Response (200 OK):**
```json
{
  "content": [
    {
      "id": 1,
      "amount": 25.99,
      "description": "Coffee shop",
      "category": "Food & Dining",
      "date": "2025-08-10",
      "createdAt": "2025-08-10T10:30:00Z"
    }
  ],
  "totalElements": 1,
  "totalPages": 1,
  "page": 0,
  "size": 10
}
```

**Error Response (403 Forbidden):**
```json
{
  "timestamp": "2025-08-10T13:00:46.000+00:00",
  "status": 403,
  "error": "Forbidden",
  "path": "/api/expenses"
}
```

---

### 8. **Get Expense Summary** (Requires Authentication)
```http
GET /api/expenses/summary?startDate=2025-01-01&endDate=2025-12-31
```

**Description:** Get expense analytics summary for date range

**Request Headers:**
```
Cookie: JSESSIONID=ABC123...
```

**Query Parameters:**
- `startDate`: Start date (YYYY-MM-DD format)
- `endDate`: End date (YYYY-MM-DD format)

**Success Response (200 OK):**
```json
[
  {
    "month": "2025-08",
    "totalAmount": 1250.75,
    "expenseCount": 45
  }
]
```

---

### 9. **Get Category Summary** (Requires Authentication)
```http
GET /api/expenses/category-summary
```

**Description:** Get expense breakdown by category

**Request Headers:**
```
Cookie: JSESSIONID=ABC123...
```

**Success Response (200 OK):**
```json
[
  {
    "category": "Food & Dining",
    "totalAmount": 450.25,
    "percentage": 36.02
  },
  {
    "category": "Transportation",
    "totalAmount": 320.50,
    "percentage": 25.64
  }
]
```

---

## 🔐 Security & Authentication Flow

### **Authentication Architecture:**
```
[React Login Form] → [POST /api/auth/login] → [CustomAuthService] → [Keycloak ROPC] → [Spring Security Session]
                                ↓
                    [HTTP Session + JSESSIONID Cookie]
                                ↓
                    [Subsequent API calls with session]
```

### **Session Management:**
- **Session Storage:** Spring Security context persisted to HTTP session
- **Cookie-based:** Uses `JSESSIONID` for session identification
- **Remember Me:** Optional 30-day persistent refresh token cookies
- **Auto-cleanup:** Sessions terminated on logout

### **Security Headers Required:**
```
Content-Type: application/json
Cookie: JSESSIONID=<session-id>
```

### **CORS Configuration:**
- **Allowed Origins:** `http://localhost:3000`, `http://localhost:8080`
- **Allowed Methods:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS`
- **Credentials:** Enabled for cookie-based authentication

---

## ⚠️ Error Handling

### **Common HTTP Status Codes:**
- **200 OK:** Request successful
- **400 Bad Request:** Invalid request data or authentication failure
- **401 Unauthorized:** Authentication required (redirects to login)
- **403 Forbidden:** Authenticated but insufficient permissions
- **500 Internal Server Error:** Server-side error

### **Error Response Format:**
```json
{
  "success": false,
  "message": "Detailed error description"
}
```

---

## 🧪 Testing Credentials

### **Demo User Account:**
- **Email:** `demo@expensetracker.com`
- **Password:** `DemoPassword123!`
- **Permissions:** Full access to all endpoints
- **Created:** Pre-configured in Keycloak for testing

### **Environment Setup:**
1. Start backend: `docker-compose up` or `./run-local.sh`
2. Start frontend: `npm start` (port 3000)
3. Access: `http://localhost:3000/login`

---

**Last Updated:** August 10, 2025 - Phase 4 Complete
**Version:** 4.0.0 - Production Ready