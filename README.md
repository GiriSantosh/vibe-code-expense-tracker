# Personal Expense Tracker

A full-stack personal expense tracking application built with Spring Boot backend and React frontend, featuring comprehensive test coverage and modern UI design.

## 🚀 Project Overview

**Live Demo:** [GitHub Repository](https://github.com/GiriSantosh/vibe-code-expense-tracker)

This application allows users to track personal expenses, categorize spending, and view analytics through an intuitive web interface. Built as a one-day development project with 90%+ test coverage.

## 📋 Features

### Core Functionality
- ✅ Add, view, and delete expenses
- ✅ Categorize expenses (Food, Transportation, Entertainment, etc.)
- ✅ Monthly expense summaries
- ✅ Category-wise spending analysis
- ✅ Interactive pie charts for data visualization
- ✅ Responsive design for mobile and desktop
- ✅ Real-time data updates

### Technical Features
- ✅ RESTful API architecture
- ✅ Comprehensive test coverage (Backend: 95%, Frontend: 90%)
- ✅ Clean code architecture with separation of concerns
- ✅ Type-safe development with TypeScript
- ✅ Modern UI with Tailwind CSS
- ✅ Interactive data visualization

## 🛠️ Technology Stack

### Backend
- **Framework:** Spring Boot 3.x
- **Language:** Java 17+
- **Build Tool:** Gradle
- **Database:** H2 (in-memory)
- **ORM:** Spring Data JPA
- **Testing:** JUnit 5, Mockito, Spring Boot Test
- **Coverage:** JaCoCo

### Frontend
- **Framework:** React 18+ with TypeScript
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Testing:** Jest, React Testing Library
- **Build Tool:** Create React App

## 🏗️ Architecture Overview

```
┌─────────────────┐    HTTP/REST API    ┌─────────────────┐
│   React Frontend │ ◄─────────────────► │ Spring Boot API │
│                 │                     │                 │
│ • Components    │                     │ • Controllers   │
│ • Hooks         │                     │ • Services      │
│ • State Mgmt    │                     │ • Repositories  │
└─────────────────┘                     └─────────────────┘
                                                   │
                                                   ▼
                                        ┌─────────────────┐
                                        │  H2 Database    │
                                        │                 │
                                        │ • Expenses      │
                                        │ • Categories    │
                                        └─────────────────┘
```

## 📁 Project Structure

```
vibe-code-expense-tracker/
├── backend/                          # Spring Boot Application
│   ├── src/main/java/
│   │   └── com/expense/tracker/
│   │       ├── ExpenseTrackerApplication.java
│   │       ├── controller/           # REST Controllers
│   │       ├── service/              # Business Logic
│   │       ├── repository/           # Data Access Layer
│   │       ├── model/                # Entity Classes
│   │       └── dto/                  # Data Transfer Objects
│   ├── src/test/java/               # Test Suite
│   ├── build.gradle                 # Build Configuration
│   └── src/main/resources/
│       └── application.properties   # App Configuration
├── expense-tracker-frontend/        # React Application
│   ├── src/
│   │   ├── components/              # React Components
│   │   ├── hooks/                   # Custom Hooks
│   │   ├── services/                # API Services
│   │   ├── types/                   # TypeScript Types
│   │   └── App.tsx                  # Main App Component
│   ├── package.json                 # Dependencies
│   └── public/                      # Static Assets
├── docs/                            # Documentation
│   ├── architecture-diagram.md
│   └── api-documentation.md
└── README.md                        # This file
```

## 🚀 Quick Start

### Prerequisites
- Java 17+
- Node.js 18+
- npm or yarn
- Git

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Run the application
./gradlew bootRun

# Run tests with coverage
./gradlew test jacocoTestReport

# View coverage report
open build/reports/jacoco/test/html/index.html
```

**Backend will be available at:** `http://localhost:8080`

### Frontend Setup

```bash
# Navigate to frontend directory
cd expense-tracker-frontend

# Install dependencies
npm install

# Start development server
npm start

# Run tests with coverage
npm test -- --coverage --watchAll=false
```

**Frontend will be available at:** `http://localhost:3000`

## 📊 API Endpoints

### Expense Management
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | Get all expenses (with optional filters) |
| POST | `/api/expenses` | Create new expense |
| GET | `/api/expenses/{id}` | Get expense by ID |
| DELETE | `/api/expenses/{id}` | Delete expense |
| GET | `/api/expenses/summary` | Get monthly summary |
| GET | `/api/expenses/category-summary` | Get category-wise totals |

### Request/Response Examples

**Create Expense:**
```json
POST /api/expenses
{
  "amount": 25.50,
  "category": "FOOD",
  "description": "Lunch at restaurant",
  "date": "2025-07-27"
}
```

**Monthly Summary:**
```json
GET /api/expenses/summary
{
  "currentMonth": "2025-07",
  "totalExpenses": 1250.75,
  "expenseCount": 45,
  "averagePerDay": 40.35
}
```

## 🧪 Testing

### Backend Testing
- **Unit Tests:** Service layer business logic
- **Integration Tests:** Full API endpoints
- **Repository Tests:** Database operations
- **Coverage Target:** 95%+

```bash
# Run all tests
./gradlew test

# Generate coverage report
./gradlew jacocoTestReport
```

### Frontend Testing
- **Component Tests:** React component rendering
- **Integration Tests:** API interactions
- **User Interaction Tests:** Form submissions, clicks
- **Coverage Target:** 90%+

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage --watchAll=false
```

## 📈 Sample Data

The application includes sample expense data for the last 2 months to demonstrate functionality:

- **Food:** Restaurant meals, groceries, coffee shops
- **Transportation:** Fuel, public transport, ride-sharing
- **Entertainment:** Movies, games, subscriptions
- **Healthcare:** Medical bills, pharmacy, insurance
- **Shopping:** Clothing, electronics, household items
- **Bills:** Utilities, phone, internet, rent
- **Other:** Miscellaneous expenses

## 🔧 Configuration

### Backend Configuration (`application.properties`)
```properties
# H2 Database
spring.datasource.url=jdbc:h2:mem:expensedb
spring.h2.console.enabled=true

# JPA
spring.jpa.hibernate.ddl-auto=create-drop
spring.jpa.show-sql=true

# CORS
cors.allowed-origins=http://localhost:3000
```

### Frontend Configuration
- **API Base URL:** `http://localhost:8080`
- **Build Tool:** Create React App
- **Styling:** Tailwind CSS with custom configuration

## 🎯 Development Timeline

**Total Development Time:** 8-10 hours (1 working day)

### Milestone 1: Backend (4-5 hours)
- ✅ Spring Boot project setup
- ✅ Database schema and entities
- ✅ Repository layer implementation
- ✅ Service layer with business logic
- ✅ REST API controllers
- ✅ Comprehensive test suite
- ✅ 95%+ test coverage achieved

### Milestone 2: Frontend (4-5 hours)
- ✅ React project setup with TypeScript
- ✅ Component architecture design
- ✅ API integration with Axios
- ✅ UI implementation with Tailwind CSS
- ✅ Data visualization with Recharts
- ✅ Comprehensive test suite
- ✅ 90%+ test coverage achieved

## 📱 Screenshots

### Dashboard View
- Monthly expense summary cards
- Category breakdown pie chart
- Recent expenses list

### Add Expense Form
- Category selection dropdown
- Amount input with validation
- Date picker
- Description field

### Expense List
- Sortable expense table
- Filter by category and date
- Delete functionality
- Responsive design

## 🚀 Deployment

### Local Development
Both backend and frontend run locally with hot-reload for development.

### Production Deployment
- **Backend:** Can be deployed to any cloud platform (AWS, Heroku, etc.)
- **Frontend:** Can be built and deployed to static hosting (Netlify, Vercel, etc.)
- **Database:** Upgrade to PostgreSQL or MySQL for production

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Santosh Giri**
- GitHub: [@GiriSantosh](https://github.com/GiriSantosh)
- Project: [vibe-code-expense-tracker](https://github.com/GiriSantosh/vibe-code-expense-tracker)

## 🙏 Acknowledgments

- Built using modern web development best practices
- Comprehensive testing approach for reliability
- Clean architecture for maintainability
- AI-assisted development for rapid prototyping

---

**⭐ If you find this project helpful, please give it a star!**
