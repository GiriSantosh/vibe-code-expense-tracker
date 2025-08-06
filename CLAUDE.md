# Personal Expense Tracker - Project Guide

## 🎯 Project Overview
**Security-first, production-ready** personal expense tracker with OAuth2, AES-256-GCM encryption, and comprehensive testing.

## 🛠️ Tech Stack
- **Backend:** Spring Boot 3.x, Java 17+, PostgreSQL, OAuth2, AES-256-GCM encryption
- **Frontend:** React 18+, TypeScript, Tailwind CSS, Highcharts
- **Infrastructure:** Docker, Keycloak, PostgreSQL
- **Testing:** JUnit 5, Jest, 70%+ coverage target

## 🔐 Security Standards
- **OAuth2:** Authorization Code Flow with Keycloak
- **Encryption:** AES-256-GCM for PII data (`@Convert(converter = EncryptedStringConverter.class)`)
- **Password Policy:** 8+ chars, uppercase, lowercase, special character
- **Environment Variables:** All secrets externalized, no hardcoded credentials

## 📝 Architecture Patterns

### **Critical: Circular Dependencies Prevention**
- **JPA:** Use `@JsonIgnore` on bidirectional mappings
- **API Design:** Use DTOs instead of entities for responses
- **Testing:** Always test API endpoints for JSON serialization

### **Backend Pattern:**
```java
@RestController // Thin controllers
@Service @Transactional // Business logic + error handling
public interface Repository extends JpaRepository<Entity, UUID> // Simple data access
```

### **Frontend Pattern:**
```typescript
interface User { id: string; email: string; } // Strict TypeScript
const useCurrentUser = () => { /* Custom hooks for API calls */ }
const AuthContext = createContext<AuthContextType>() // Context for state
```

## 🧪 Testing Philosophy & Standards

### **Backend Testing (Target: 70%+ coverage)**
```java
// Test structure I prefer
@SpringBootTest
@TestPropertySource(properties = "spring.profiles.active=test")
class UserServiceTest {
    
    @Test
    @DisplayName("Should encrypt email when creating user")
    void shouldEncryptEmailWhenCreatingUser() {
        // Given - setup test data
        // When - execute the method
        // Then - verify results with proper assertions
    }
    
    // Always test security scenarios
    @Test
    @WithMockUser(roles = "USER")
    void shouldAllowUserToAccessOwnData() {
        // Test authorization
    }
}
```

### **Frontend Testing (Target: 90%+ coverage)**
```typescript
// Component testing pattern
describe('UserProfile Component', () => {
  beforeEach(() => {
    // Setup MSW handlers for API mocking
    server.use(
      rest.get('/api/me', (req, res, ctx) => {
        return res(ctx.json(mockUser));
      })
    );
  });

  it('should display masked email for privacy', async () => {
    render(<UserProfile />);
    expect(await screen.findByText('j***@***.com')).toBeInTheDocument();
  });
});
```

## 🔧 Testing Lessons Learned

### **Frontend Test Configuration:**
- **Highcharts Mocking:** Components using Highcharts need proper mocks, not Recharts mocks
- **Jest Configuration:** Use modern `transform: { '^.+\.(ts|tsx)$': ['ts-jest', config] }` format
- **Component Props:** Match actual component props (e.g., `isLoading` not `loading`)

### **Backend Test Configuration:**
- **Test Profiles:** Always use `@ActiveProfiles("test")` for all test classes
- **Database Strategy:** PostgreSQL for dev/prod, H2 for tests with separate application-test.properties
- **Security Tests:** Mock security context properly with TestSecurityConfig

## 🐳 Docker & Infrastructure Preferences

### **My Docker Compose Structure:**
```yaml
# Always separate dev and prod configurations
# docker-compose.dev.yml for development
# docker-compose.prod.yml for production

services:
  postgres:
    # Use specific versions, not 'latest'
    image: postgres:15
    
  keycloak:
    # Configure with proper password policies
    image: quay.io/keycloak/keycloak:23.0
    
  backend:
    # Multi-stage builds for optimization
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      # Always use environment variables for secrets
```

## 📊 API Design Standards

### **REST API Patterns I Follow:**
```java
// Consistent response format
@GetMapping("/api/expenses")
public ResponseEntity<PagedResponse<ExpenseDTO>> getExpenses(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "20") int size,
    @RequestParam(required = false) String category,
    Authentication auth) {
    
    // Always include pagination for lists
    // Use proper HTTP status codes
    // Include authentication in all protected endpoints
}

// Proper error handling
@ExceptionHandler(UserNotFoundException.class)
public ResponseEntity<ErrorResponse> handleUserNotFound(UserNotFoundException ex) {
    return ResponseEntity.status(HttpStatus.NOT_FOUND)
        .body(new ErrorResponse("USER_NOT_FOUND", ex.getMessage()));
}
```

### **API Security Patterns:**
- All endpoints require OAuth2 authentication (except public ones)
- Use `@PreAuthorize` for method-level security
- Always validate user ownership of resources
- Include proper CORS configuration
- Log security events for auditing

### **JSON Serialization & Circular Dependencies:**
```java
// ALWAYS prevent circular references in JPA entities
@Entity
public class User {
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonIgnore  // Prevents User → Expenses → User infinite loop
    private List<Expense> expenses = new ArrayList<>();
}

@Entity
public class Expense {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore  // Prevents Expense → User → Expenses infinite loop
    private User user;
}

// Alternative: Use DTOs to control serialization
public class ExpenseDTO {
    private Long id;
    private BigDecimal amount;
    private String category;
    // No user field = no circular reference
}
```

**Best Practices for Avoiding Circular Dependencies:**
1. **Use @JsonIgnore:** Break bidirectional relationships at serialization level
2. **Implement DTOs:** Create separate objects for API responses without circular refs
3. **Use @JsonManagedReference/@JsonBackReference:** For parent-child relationships
4. **Fetch Strategy:** Use LAZY loading to prevent unnecessary data loading
5. **API Design:** Return only necessary data - avoid deep object graphs
6. **Testing:** Always test API responses for infinite loops in JSON serialization

## 🎨 UI/UX Design Philosophy

### **Tailwind CSS Patterns I Use:**
```tsx
// Consistent spacing and colors
const Card = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
    {children}
  </div>
);

// Responsive design first
const ExpenseList = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    {/* Always include mobile-first responsive design */}
  </div>
);
```

### **Form Validation Standards:**
```typescript
// Client-side validation with server-side backup
const validatePassword = (password: string): string[] => {
  const errors: string[] = [];
  if (!/(?=.*[a-z])/.test(password)) errors.push('Must contain lowercase letter');
  if (!/(?=.*[A-Z])/.test(password)) errors.push('Must contain uppercase letter');
  if (!/(?=.*[!@#$%^&*])/.test(password)) errors.push('Must contain special character');
  return errors;
};
```

## 🔐 Enhanced Logout System
- **Keycloak Admin API:** `KeycloakAdminService` for session termination
- **Enhanced Handler:** `EnhancedOidcLogoutSuccessHandler` for complete logout flow
- **Nuclear Logout:** Frontend complete session cleanup (localStorage + sessionStorage + redirect)

## 🚀 Development Workflow
- **Git:** Conventional commits (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`)
- **Branches:** `main` (prod), `develop` (integration), `feature/*`, `hotfix/*`
- **Environment:** Docker for consistency, proper `.env` management
- **Quality:** Always run tests before committing (`./gradlew test && npm test`)

## 🎯 Implementation Priorities
1. **Security First:** OAuth2 → AES-256-GCM → User Isolation
2. **Test Coverage:** Maintain 70%+ throughout development
3. **Error Handling:** Comprehensive error handling in all layers
4. **Environment Variables:** Proper externalization for all secrets
5. **Production Ready:** Deployable code, not just functional

## 🔍 Project Status

### **✅ Completed (PRODUCTION READY)**
- **Phase 1:** CRUD operations, analytics, 70%+ test coverage, Tailwind UI
- **Phase 2:** OAuth2 + Keycloak, AES-256-GCM encryption, PostgreSQL, Docker
- **Phase 3:** Security hardening, enhanced logout, nuclear logout, optimized Docker

### **🚀 Deployment Options**
- **Local IDE:** `./run-local.sh` (recommended for development)
- **Docker Dev:** `docker-compose -f docker-compose.dev.yml up`
- **Production:** `docker-compose -f docker-compose.prod.yml up`
- **Credentials:** `demo@expensetracker.com` / `DemoPassword123!`

### **⚠️ Known Issues**
- **SSO Logout:** Keycloak session persistence (SIGNIFICANTLY IMPROVED with nuclear logout)

### **🎯 Future Enhancements**
- API rate limiting, advanced monitoring, multi-tenancy, automated CI/CD

---

**Philosophy:** Clean, secure, well-tested code. Every feature production-ready with proper error handling and documentation.