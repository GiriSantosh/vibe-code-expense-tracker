# Personal Expense Tracker - Product Requirements Document

## Project Overview

**Product Name:** Personal Expense Tracker  
**Project Type:** Full-stack web application with comprehensive testing  
**Timeline:** 1 day development with 90%+ test coverage  
**Architecture:** React frontend + Spring Boot backend + H2 database

## Business Requirements

### Purpose
Build a simple personal expense tracking application that allows users to record, categorize, and analyze their daily expenses with comprehensive test coverage.

### Success Criteria
- Complete CRUD operations for expenses
- Category-wise expense analysis
- Monthly spending summaries
- 90%+ code coverage for both frontend and backend
- Clean, testable architecture suitable for AI-assisted development

## Technical Requirements

### Technology Stack

**Backend:**
- Java 17+
- Spring Boot 3.x
- Spring Web (REST APIs)
- Spring Data JPA
- H2 Database (in-memory for development)
- Gradle build system
- JUnit 5 for testing
- Mockito for mocking
- JaCoCo for code coverage
- Spring Boot Test for integration tests

**Frontend:**
- React 18+
- TypeScript (optional but recommended)
- Axios for HTTP requests
- Recharts for data visualization
- Tailwind CSS for styling
- Jest + React Testing Library for tests
- Node.js 18+

### Architecture Patterns
- RESTful API design
- Repository pattern for data access
- Service layer for business logic
- Component-based frontend architecture
- Clear separation of concerns

## Functional Requirements

### Core Features

#### Expense Management
- **Add Expense:** Record new expense with amount, category, description, and date
- **View Expenses:** Display all expenses in a list/table format
- **Delete Expense:** Remove expenses from the system
- **Filter Expenses:** Filter by category, date range, or amount range

#### Categories
- **Predefined Categories:** Food, Transportation, Entertainment, Healthcare, Shopping, Bills, Other
- **Category Summary:** Show total spending per category

#### Analytics
- **Monthly Summary:** Total expenses for current month
- **Category Breakdown:** Pie chart showing expense distribution by category
- **Recent Expenses:** Display last 10 expenses

### Data Model

#### Expense Entity
```json
{
  "id": "Long (auto-generated)",
  "amount": "BigDecimal (required, positive)",
  "category": "String (required, enum)",
  "description": "String (optional, max 255 chars)",
  "date": "LocalDate (required)",
  "createdAt": "LocalDateTime (auto-generated)"
}
```

#### Category Enum
```java
public enum ExpenseCategory {
    FOOD, TRANSPORTATION, ENTERTAINMENT, 
    HEALTHCARE, SHOPPING, BILLS, OTHER
}
```

## API Specifications

### REST Endpoints

#### Expense Controller
- `GET /api/expenses` - Get all expenses (with optional filters)
- `POST /api/expenses` - Create new expense
- `GET /api/expenses/{id}` - Get expense by ID
- `DELETE /api/expenses/{id}` - Delete expense
- `GET /api/expenses/summary` - Get monthly summary
- `GET /api/expenses/category-summary` - Get category-wise totals

#### Request/Response Examples

**POST /api/expenses**
```json
Request:
{
  "amount": 25.50,
  "category": "FOOD",
  "description": "Lunch at restaurant",
  "date": "2025-07-27"
}

Response:
{
  "id": 1,
  "amount": 25.50,
  "category": "FOOD",
  "description": "Lunch at restaurant",
  "date": "2025-07-27",
  "createdAt": "2025-07-27T10:30:00"
}
```

**GET /api/expenses/summary**
```json
Response:
{
  "currentMonth": "2025-07",
  "totalExpenses": 1250.75,
  "expenseCount": 45,
  "averagePerDay": 40.35
}
```

## Testing Strategy

### Backend Testing (Target: 95% Coverage)

#### Unit Tests (60% of coverage)
- **Service Layer Tests:** Business logic, validations, calculations
- **Controller Tests:** @WebMvcTest for endpoint testing
- **Repository Tests:** @DataJpaTest for database operations

#### Integration Tests (35% of coverage)
- **Full API Tests:** @SpringBootTest with TestRestTemplate
- **Database Integration:** Test complete request/response cycles
- **Error Scenarios:** Invalid inputs, not found cases

#### Test Categories to Cover:
- Expense CRUD operations
- Category validation
- Date filtering logic
- Summary calculations
- Error handling (400, 404, 500)
- Input validation

### Frontend Testing (Target: 90% Coverage)

#### Component Tests (70% of coverage)
- **Render Tests:** Component mounting and basic rendering
- **User Interaction Tests:** Form submissions, button clicks
- **Props Testing:** Component behavior with different props
- **State Management:** Local state updates

#### Integration Tests (20% of coverage)
- **API Integration:** Mock API calls and responses
- **User Workflows:** Complete user journeys
- **Error Handling:** Network errors, validation errors

#### Test Scenarios:
- Expense form submission
- Expense list rendering
- Category filtering
- Summary display
- Error message display
- Loading states

## Development Milestones

---

## Milestone 1: Backend Development & Testing

### Duration: 4-5 hours

### Deliverables:

#### Core Backend Implementation
1. **Project Setup**
    - Spring Boot project with required dependencies
    - Gradle configuration with JaCoCo plugin
    - Application properties for H2 database
    - CORS configuration for frontend integration

2. **Data Layer**
    - Expense entity with JPA annotations
    - ExpenseCategory enum
    - ExpenseRepository interface extending JpaRepository
    - Custom query methods for filtering and summaries

3. **Service Layer**
    - ExpenseService interface and implementation
    - Business logic for CRUD operations
    - Summary calculation methods
    - Input validation and error handling

4. **Controller Layer**
    - ExpenseController with REST endpoints
    - Request/Response DTOs
    - Proper HTTP status codes
    - Error handling with @ControllerAdvice

5. **Configuration**
    - Database initialization script
    - CORS configuration
    - Exception handling configuration

#### Comprehensive Testing Suite
1. **Unit Tests**
    - ExpenseServiceTest (mock repository)
    - ExpenseControllerTest (@WebMvcTest)
    - ExpenseRepositoryTest (@DataJpaTest)
    - DTO validation tests

2. **Integration Tests**
    - Full API integration tests
    - Database integration tests
    - Error scenario tests

3. **Test Data**
    - Test fixtures and builders
    - Mock data generators
    - Test utility classes

### Testing Targets:
- **Service Layer:** 100% line coverage
- **Controller Layer:** 95% line coverage
- **Repository Layer:** 90% line coverage
- **Overall Backend:** 95% line coverage

### Acceptance Criteria:
- All REST endpoints working correctly
- Comprehensive test suite passing
- JaCoCo report showing 95%+ coverage
- Proper error handling and validation
- API documentation (can be simple comments)
- Application runs without errors

### File Structure:
```
src/
├── main/java/com/expense/tracker/
│   ├── ExpenseTrackerApplication.java
│   ├── controller/
│   │   ├── ExpenseController.java
│   │   └── GlobalExceptionHandler.java
│   ├── service/
│   │   ├── ExpenseService.java
│   │   └── ExpenseServiceImpl.java
│   ├── repository/
│   │   └── ExpenseRepository.java
│   ├── model/
│   │   ├── Expense.java
│   │   └── ExpenseCategory.java
│   ├── dto/
│   │   ├── ExpenseRequest.java
│   │   ├── ExpenseResponse.java
│   │   └── ExpenseSummary.java
│   └── config/
│       └── CorsConfig.java
└── test/java/com/expense/tracker/
    ├── controller/
    │   └── ExpenseControllerTest.java
    ├── service/
    │   └── ExpenseServiceTest.java
    ├── repository/
    │   └── ExpenseRepositoryTest.java
    └── integration/
        └── ExpenseIntegrationTest.java
```

---

## Milestone 2: Frontend Development & Testing

### Duration: 4-5 hours

### Deliverables:

#### React Application Implementation
1. **Project Setup**
    - Create React app with TypeScript (optional)
    - Install required dependencies (axios, recharts, tailwind)
    - Configure testing environment
    - Setup coverage reporting

2. **Component Architecture**
    - ExpenseForm component (add new expenses)
    - ExpenseList component (display expenses)
    - ExpenseItem component (individual expense row)
    - ExpenseSummary component (monthly summary)
    - CategoryChart component (pie chart)
    - FilterControls component

3. **State Management**
    - Custom hooks for expense management
    - API service layer with axios
    - Error handling and loading states
    - Form validation

4. **UI/UX Implementation**
    - Responsive design with Tailwind CSS
    - Form validation feedback
    - Loading spinners and error messages
    - Clean, intuitive interface

#### Comprehensive Frontend Testing
1. **Component Tests**
    - Unit tests for each component
    - User interaction testing
    - Props and state testing
    - Error boundary testing

2. **Integration Tests**
    - API integration with mocked responses
    - User workflow testing
    - Form submission flows

3. **Utility Tests**
    - Custom hooks testing
    - Helper function testing
    - API service testing

### Testing Targets:
- **Components:** 90% line coverage
- **Custom Hooks:** 95% line coverage
- **Utilities:** 100% line coverage
- **Overall Frontend:** 90% line coverage

### Acceptance Criteria:
- Fully functional expense tracking interface
- All CRUD operations working through UI
- Responsive design working on mobile/desktop
- Comprehensive test suite passing
- Jest coverage report showing 90%+ coverage
- Error handling and validation working
- Charts displaying correctly

### File Structure:
```
src/
├── components/
│   ├── ExpenseForm/
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpenseForm.test.tsx
│   │   └── index.ts
│   ├── ExpenseList/
│   │   ├── ExpenseList.tsx
│   │   ├── ExpenseList.test.tsx
│   │   └── index.ts
│   ├── ExpenseSummary/
│   │   ├── ExpenseSummary.tsx
│   │   ├── ExpenseSummary.test.tsx
│   │   └── index.ts
│   └── common/
│       ├── LoadingSpinner.tsx
│       └── ErrorMessage.tsx
├── hooks/
│   ├── useExpenses.ts
│   ├── useExpenses.test.ts
│   └── useApi.ts
├── services/
│   ├── expenseApi.ts
│   ├── expenseApi.test.ts
│   └── mockData.ts
├── types/
│   └── expense.ts
├── utils/
│   ├── formatters.ts
│   ├── validators.ts
│   └── constants.ts
└── App.tsx
```

## Quality Assurance

### Code Quality Standards
- Clean, readable code with proper naming conventions
- Comprehensive error handling
- Input validation on both frontend and backend
- Proper logging for debugging
- Code comments for complex logic

### Testing Standards
- All critical paths covered by tests
- Both positive and negative test cases
- Edge cases and boundary conditions tested
- Integration tests for complete workflows
- Performance considerations for large datasets

### Documentation Requirements
- README with setup instructions
- API documentation
- Component documentation
- Test coverage reports
- Known limitations and future enhancements

## Constraints & Assumptions

### Technical Constraints
- Single-day development timeline
- H2 in-memory database (data doesn't persist between restarts)
- No user authentication/authorization
- No concurrent user support
- Simple deployment (no Docker/cloud deployment)

### Assumptions
- Development environment has Java 17+, Node.js 18+, and Maven
- Basic familiarity with Spring Boot and React
- AI coding assistant (Claude Code/Cursor) will be used
- Target audience is single user (personal use)

## Success Metrics

### Functional Success
- All CRUD operations working correctly
- Summary and analytics displaying accurate data
- Responsive UI working across devices
- Error handling providing helpful feedback

### Technical Success
- Backend test coverage ≥ 95%
- Frontend test coverage ≥ 90%
- All tests passing
- Clean, maintainable code structure
- Application running without errors

### Timeline Success
- Milestone 1 completed in 4-5 hours
- Milestone 2 completed in 4-5 hours
- Total project completion in 8-10 hours (1 working day)

## Future Enhancements (Out of Scope)

- User authentication and multi-user support
- Data persistence with PostgreSQL/MySQL
- Advanced analytics and reporting
- Receipt photo uploads
- Budget tracking and alerts
- Export functionality (CSV, PDF)
- Mobile app development
- Deployment to cloud platforms