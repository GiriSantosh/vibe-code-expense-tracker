## 🏗️ Architecture Overview

### High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        UI[React 18 Frontend<br/>TypeScript + Material-UI + Tailwind CSS]
        MUI[Material-UI Dashboard<br/>Responsive Components + Highcharts]
        Browser[Web Browser<br/>http://localhost:3000]
    end
    
    subgraph "Security Layer"
        KC[Keycloak Identity Provider<br/>OAuth2 Authentication]
        JWT[JWT Authentication Filter<br/>Token Validation]
        ENC[AES-256-GCM Encryption<br/>PII Data Protection]
    end
    
    subgraph "API Gateway"
        SPRING[Spring Boot 3.x API<br/>http://localhost:8080]
        CORS[CORS Configuration<br/>Cross-Origin Resource Sharing]
        AUTH[Custom Auth Endpoints<br/>/api/auth/*]
    end
    
    subgraph "Web Layer"
        CONTROLLER[REST Controllers<br/>com.expensetracker.web.controller]
        FILTER[Authentication Filters<br/>com.expensetracker.web.filters]
        WEB_EX[Client Exceptions<br/>com.expensetracker.web.exception]
    end
    
    subgraph "Business Layer"
        SERVICE[Business Services<br/>com.expensetracker.backend.service]
        CONFIG[Backend Configuration<br/>com.expensetracker.backend.config]
        BACKEND_EX[Internal Exceptions<br/>com.expensetracker.backend.exception]
        UTIL[Utility Classes<br/>com.expensetracker.backend.util]
    end
    
    subgraph "Data Layer"
        MAPPER[DTOs & Mappers<br/>com.expensetracker.mapper]
        MODEL[JPA Entities<br/>com.expensetracker.model]
        REPO[Repository Layer<br/>com.expensetracker.repository]
        JPA[Spring Data JPA<br/>ORM Framework]
        Database[(PostgreSQL Database<br/>Production Grade)]
    end
    
    Browser --> UI
    UI --> MUI
    MUI --> |HTTP/REST API<br/>Axios Requests| SPRING
    SPRING --> CORS
    CORS --> AUTH
    AUTH --> KC
    KC --> JWT
    JWT --> FILTER
    FILTER --> CONTROLLER
    CONTROLLER --> SERVICE
    SERVICE --> ENC
    SERVICE --> MAPPER
    SERVICE --> MODEL
    MODEL --> REPO
    REPO --> JPA
    JPA --> Database
    
    CONTROLLER --> WEB_EX
    SERVICE --> BACKEND_EX
    SERVICE --> CONFIG
    SERVICE --> UTIL
    
    style UI fill:#e1f5fe
    style MUI fill:#e8f5e8
    style KC fill:#ffebee
    style SPRING fill:#f3e5f5
    style SERVICE fill:#e8f5e8
    style Database fill:#fff3e0
```

### Enterprise Package Structure

```mermaid
graph TB
    subgraph "com.expensetracker Package Structure"
        subgraph "main"
            APP[PersonalExpenseTrackerApplication<br/>@SpringBootApplication]
        end
        
        subgraph "backend - Business Logic Layer"
            B_CONFIG[config/<br/>Security, Data, Web Configuration]
            B_SERVICE[service/<br/>Business Logic & Processing]
            B_UTIL[util/<br/>Encryption & Utility Classes]
            B_EX[exception/<br/>Internal Server Errors (5xx)]
        end
        
        subgraph "web - Presentation Layer"
            W_CONTROLLER[controller/<br/>REST API Endpoints]
            W_FILTER[filters/<br/>JWT Authentication Filter]
            W_CONFIG[config/<br/>Security Handlers & Web Config]
            W_EX[exception/<br/>Client Errors (4xx)]
        end
        
        subgraph "mapper - Data Transfer"
            MAPPER[DTOs, Requests, Responses<br/>Data Transformation Layer]
        end
        
        subgraph "Shared Layers"
            MODEL[model/<br/>JPA Entities & Domain Objects]
            REPO[repository/<br/>Data Access Layer]
        end
    end
    
    APP --> B_CONFIG
    APP --> W_CONFIG
    W_CONTROLLER --> B_SERVICE
    W_FILTER --> B_SERVICE
    B_SERVICE --> MAPPER
    B_SERVICE --> MODEL
    B_SERVICE --> REPO
    W_CONTROLLER --> MAPPER
    W_CONTROLLER --> W_EX
    B_SERVICE --> B_EX
    B_SERVICE --> B_UTIL
    
    style APP fill:#e1f5fe
    style B_SERVICE fill:#e8f5e8
    style W_CONTROLLER fill:#fff3e0
    style MAPPER fill:#f3e5f5
    style MODEL fill:#ffebee
```

### OAuth2 Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant MUI as Material-UI Frontend
    participant Auth as AuthController
    participant Custom as CustomAuthService
    participant KC as Keycloak
    participant JWT as JwtAuthenticationFilter
    participant Service as ExpenseService
    
    User->>MUI: Login with Credentials
    MUI->>Auth: POST /api/auth/login
    Auth->>Custom: authenticateUser()
    Custom->>KC: Resource Owner Password Flow
    KC-->>Custom: Access Token + Refresh Token
    Custom->>Custom: Validate & Create Session
    Custom-->>Auth: Authentication Success
    Auth-->>MUI: HTTP-Only Cookies + User Info
    MUI->>MUI: Update Auth Context
    MUI-->>User: Redirect to Dashboard
    
    Note over User,Service: Subsequent API Requests
    User->>MUI: Add New Expense
    MUI->>JWT: POST /api/expenses (with cookies)
    JWT->>KC: Validate Token
    KC-->>JWT: Token Valid + User Info
    JWT->>Service: Authorized Request
    Service->>Service: Business Logic + Encryption
    Service-->>JWT: Response Data
    JWT-->>MUI: 201 Created + Data
    MUI-->>User: Success Message
```

### Component Interaction Flow

```mermaid
sequenceDiagram
    participant User
    participant Dashboard as Material-UI Dashboard
    participant Controller as ExpenseController
    participant Service as ExpenseService
    participant Encryption as EncryptionService
    participant DB as PostgreSQL
    
    User->>Dashboard: Add New Expense
    Dashboard->>Dashboard: Form Validation (Material-UI)
    Dashboard->>Controller: POST /api/expenses
    Controller->>Controller: Input Validation
    Controller->>Service: createExpense()
    Service->>Service: Business Logic Validation
    Service->>Encryption: Encrypt PII Data
    Encryption-->>Service: Encrypted Data
    Service->>DB: Save to PostgreSQL
    DB-->>Service: Return Saved Entity
    Service->>Encryption: Decrypt for Response
    Encryption-->>Service: Decrypted Data
    Service-->>Controller: ExpenseDTO Response
    Controller-->>Dashboard: 201 Created + Data
    Dashboard->>Dashboard: Update Charts & Analytics
    Dashboard-->>User: Success Notification
```

### Database Schema (PostgreSQL)

```mermaid
erDiagram
    USERS {
        UUID id PK "Auto-generated UUID"
        VARCHAR email "Encrypted with AES-256-GCM"
        VARCHAR keycloak_id "Keycloak user identifier"
        TIMESTAMP created_at "Creation timestamp"
        TIMESTAMP updated_at "Last update timestamp"
    }
    
    USER_PREFERENCES {
        UUID id PK "Auto-generated UUID"
        UUID user_id FK "Reference to users table"
        VARCHAR currency "Default currency (USD, EUR, etc.)"
        VARCHAR date_format "Preferred date format"
        VARCHAR language "User language preference"
        TIMESTAMP created_at "Creation timestamp"
        TIMESTAMP updated_at "Last update timestamp"
    }
    
    EXPENSES {
        UUID id PK "Auto-generated UUID"
        UUID user_id FK "Reference to users table"
        DECIMAL amount "Expense amount"
        VARCHAR category "Category enum (FOOD, TRANSPORTATION, etc.)"
        VARCHAR description "Optional description (encrypted)"
        DATE date "Expense date"
        TIMESTAMP created_at "Creation timestamp"
        TIMESTAMP updated_at "Last update timestamp"
    }
    
    EXPENSE_CATEGORIES {
        string FOOD "Food and dining"
        string TRANSPORTATION "Travel and transport"
        string ENTERTAINMENT "Entertainment"
        string HEALTHCARE "Medical expenses"
        string SHOPPING "Shopping"
        string BILLS "Utilities and bills"
        string OTHER "Miscellaneous"
    }
    
    USERS ||--o{ USER_PREFERENCES : "has preferences"
    USERS ||--o{ EXPENSES : "owns expenses"
    EXPENSES ||--|| EXPENSE_CATEGORIES : "belongs to category"
```

### Security Architecture

```mermaid
graph TB
    subgraph "Authentication Layer"
        LOGIN[Custom Login Page<br/>Material-UI Form]
        KC_AUTH[Keycloak OAuth2<br/>Resource Owner Password Flow]
        JWT_GEN[JWT Token Generation<br/>Access + Refresh Tokens]
    end
    
    subgraph "Authorization Layer"
        JWT_FILTER[JwtAuthenticationFilter<br/>com.expensetracker.web.filters]
        SEC_CONTEXT[Spring Security Context<br/>Session Management]
        ROLE_AUTH[Role-based Authorization<br/>@PreAuthorize]
    end
    
    subgraph "Data Protection Layer"
        AES_ENC[AES-256-GCM Encryption<br/>PII Data Protection]
        FIELD_ENC[Field-Level Encryption<br/>@Convert annotations]
        HTTP_COOKIES[HTTP-Only Cookies<br/>Secure Token Storage]
    end
    
    LOGIN --> KC_AUTH
    KC_AUTH --> JWT_GEN
    JWT_GEN --> HTTP_COOKIES
    HTTP_COOKIES --> JWT_FILTER
    JWT_FILTER --> SEC_CONTEXT
    SEC_CONTEXT --> ROLE_AUTH
    ROLE_AUTH --> AES_ENC
    AES_ENC --> FIELD_ENC
    
    style LOGIN fill:#e1f5fe
    style KC_AUTH fill:#ffebee
    style JWT_FILTER fill:#e8f5e8
    style AES_ENC fill:#fff3e0
```

### Material-UI Dashboard Architecture

```mermaid
graph TB
    subgraph "Frontend Architecture"
        subgraph "Layout Components"
            LAYOUT[DashboardLayout<br/>Responsive Sidebar + AppBar]
            NAV[Navigation<br/>Material-UI Drawer]
            BREADCRUMB[Breadcrumb Navigation<br/>Path Indicators]
        end
        
        subgraph "Dashboard Components"
            METRICS[Metric Cards<br/>CSS Grid Layout]
            ANALYTICS[ExpenseAnalytics<br/>Progress Bars + Icons]
            CHARTS[Highcharts Integration<br/>Category & Monthly Charts]
        end
        
        subgraph "Form Components"
            AUTH_FORMS[Auth Forms<br/>Login/Signup Material-UI]
            EXPENSE_FORMS[Expense Forms<br/>Validation + Error Handling]
            FILTERS[Filter Controls<br/>Date Range + Category]
        end
        
        subgraph "State Management"
            AUTH_CONTEXT[AuthContext<br/>User Authentication State]
            EXPENSE_HOOKS[useExpenses Hook<br/>Data Fetching + Caching]
            API_SERVICE[API Service<br/>Axios Configuration]
        end
    end
    
    LAYOUT --> NAV
    LAYOUT --> BREADCRUMB
    LAYOUT --> METRICS
    METRICS --> ANALYTICS
    ANALYTICS --> CHARTS
    AUTH_FORMS --> AUTH_CONTEXT
    EXPENSE_FORMS --> EXPENSE_HOOKS
    FILTERS --> EXPENSE_HOOKS
    EXPENSE_HOOKS --> API_SERVICE
    
    style LAYOUT fill:#e1f5fe
    style ANALYTICS fill:#e8f5e8
    style AUTH_CONTEXT fill:#fff3e0
    style API_SERVICE fill:#f3e5f5
```

