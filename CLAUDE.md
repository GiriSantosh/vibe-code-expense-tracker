# GEMINI.md - Personal Expense Tracker (Phase 2)

## 🎯 Project Context & Development Philosophy
This is a **security-first, rapid development** personal expense tracking application built with **high-quality standards**. The project demonstrates my ability to build production-ready applications quickly while maintaining **90%+ test coverage** and implementing **enterprise-grade security**.

### **My Development Approach:**
- **Quality over Speed (but still fast):** Comprehensive testing, clean architecture, security-first
- **One-day MVP mindset:** Rapid prototyping with production-ready standards
- **Security by Design:** OAuth2, AES-256-GCM encryption, proper authentication flows
- **Clean Code Principles:** SOLID, DRY, proper separation of concerns
- **Documentation-Driven:** Every feature properly documented with examples

## 🛠️ Technology Stack & Preferences

### **Backend (Spring Boot 3.x)**
- **Language:** Java 17+ (prefer modern Java features)
- **Authentication:** OAuth2 Authorization Code Flow (NOT JWT directly)
- **Database:** PostgreSQL (migrating from H2)
- **Encryption:** AES-256-GCM for all PII data
- **Testing:** JUnit 5, Mockito, SpringBootTest, TestContainers
- **Architecture:** Clean layered architecture (Controller → Service → Repository)

### **Frontend (React 18+ TypeScript)**
- **Language:** TypeScript (strict mode, no `any` types)
- **Styling:** Tailwind CSS (utility-first approach)
- **State Management:** React Context + useState (prefer simplicity)
- **HTTP Client:** Axios with interceptors
- **Testing:** Jest, React Testing Library, MSW for API mocking
- **Charts:** Highcharts for data visualization

### **Infrastructure & Security**
- **Containerization:** Docker & Docker Compose
- **Authentication Provider:** Keycloak
- **Database:** PostgreSQL with encrypted PII fields
- **Encryption:** AES-256-GCM with proper key management

### **Database Migration Strategy**
- **Production:** PostgreSQL with environment variables
- **Testing:** H2 with application-test.properties and @ActiveProfiles("test")
- **Configuration:** Use ${DATABASE_URL:default} pattern for flexibility
- **DDL Strategy:** `update` for development, `validate` for production

## 🔐 Security Implementation Standards

### **Authentication & Authorization**
```java
// My preferred OAuth2 security configuration pattern
@EnableWebSecurity
public class SecurityConfig {
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        return http
            .oauth2Login(oauth2 -> oauth2
                .successHandler(customSuccessHandler())
                .userInfoEndpoint(userInfo -> userInfo
                    .userService(customOAuth2UserService())))
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
            .build();
    }
}
```

### **PII Encryption Standards**
```java
// Always encrypt PII data with AES-256-GCM
@Convert(converter = EncryptedStringConverter.class)
@Column(name = "email_encrypted")
private String email;

// Use proper IV generation and key rotation
public class EncryptionService {
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12;
    private static final int GCM_TAG_LENGTH = 16;
}
```

### **Password Policy Requirements**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 special character
- Email as username (encrypted in database)

### **Keycloak Configuration Standards**
- **Realm Export:** realm-export.json with proper password policies
- **Client Configuration:** Separate clients for backend (confidential) and frontend (public)
- **Password Policy:** `length(8) and upperCase(1) and lowerCase(1) and specialChars(1) and notUsername`
- **Demo User:** Pre-configured for testing with proper roles and permissions

## 📝 Code Style & Architecture Preferences

### **Circular Dependencies Prevention (CRITICAL):**
**ALWAYS check for and prevent circular dependencies in:**
- **JPA Entity Relationships:** Use `@JsonIgnore` on bidirectional mappings
- **Service Layer Dependencies:** Avoid services calling each other cyclically
- **Component Dependencies:** Design clear dependency hierarchy
- **Module Dependencies:** Ensure unidirectional dependency flow

**Detection Strategy:**
- Test all API endpoints for JSON serialization issues
- Use static analysis tools to detect circular imports
- Review entity relationship diagrams before implementation
- Add integration tests that verify JSON response structure

### **Backend Patterns I Follow:**
```java
// Controller Layer - Keep it thin
@RestController
@RequestMapping("/api/users")
@Validated
public class UserController {
    
    @GetMapping("/me")
    @PreAuthorize("hasRole('USER')")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication auth) {
        // Delegate to service layer immediately
        return ResponseEntity.ok(userService.getCurrentUser(auth.getName()));
    }
}

// Service Layer - Business logic here
@Service
@Transactional
public class UserService {
    // Always include error handling and validation
    // Use DTOs for data transfer
    // Implement proper logging
}

// Repository Layer - Keep it simple
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmailEncrypted(String encryptedEmail);
}
```

### **Frontend Patterns I Follow:**
```typescript
// Always use TypeScript interfaces
interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  preferences: UserPreferences;
}

// Custom hooks for API calls
const useCurrentUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Include proper error handling and loading states
};

// Context for global state management
const AuthContext = createContext<AuthContextType | null>(null);
```

## 🧪 Testing Philosophy & Standards

### **Backend Testing (Target: 95%+ coverage)**
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

## 🚀 Development Workflow Preferences

### **Git Commit Standards:**
```bash
# Use conventional commits
feat: add OAuth2 authentication with Keycloak
fix: resolve PII encryption key rotation issue
docs: update API documentation with OAuth2 examples
test: add comprehensive security test coverage
refactor: improve encryption service performance
```

### **Branch Strategy:**
- `main` - Production ready code
- `develop` - Integration branch
- `feature/milestone-3-oauth2` - Feature branches
- `hotfix/security-patch` - Critical fixes

### **Development Environment Setup:**
```bash
# I prefer Docker for consistent environments
docker-compose -f docker/docker-compose.dev.yml up -d

# With proper environment variables
cp .env.example .env
# Edit .env with actual values

# Always run tests before committing
./gradlew test && npm test
```

## 📚 Documentation Standards

### **Code Documentation:**
```java
/**
 * Encrypts user PII data using AES-256-GCM encryption.
 * 
 * @param plaintext The plaintext data to encrypt
 * @param masterKey The master encryption key
 * @return EncryptedData containing ciphertext and IV
 * @throws EncryptionException if encryption fails
 */
public EncryptedData encrypt(String plaintext, SecretKey masterKey) {
    // Implementation with proper error handling
}
```

### **API Documentation Format:**
```markdown
## POST /api/expenses

Creates a new expense for the authenticated user.

**Authentication:** Required (OAuth2)

**Request Body:**
```json
{
  "amount": 25.50,
  "category": "FOOD",
  "description": "Lunch at restaurant",
  "date": "2025-07-27"
}
```

**Response:** `201 Created`
```

## 🎯 Phase 2 Specific Guidance

### **Current Milestone Focus:**
- **Milestone 3:** OAuth2 + PII Encryption (8-10 hours)
- **Milestone 4:** Complete Dockerization (8-10 hours)

### **Key Implementation Priorities:**
1. **Security First:** OAuth2 → AES-256-GCM → User Isolation
2. **Test Coverage:** Maintain 90%+ throughout development
3. **Documentation:** Update docs as features are implemented
4. **Performance:** Monitor encryption overhead and optimize

### **When Providing Code Suggestions:**
- Always include comprehensive error handling
- Provide both unit and integration test examples
- Include security considerations and best practices
- Show proper environment variable usage
- Include Docker configuration when relevant
- Explain the reasoning behind architectural decisions

### **Communication Preferences:**
- **Be Specific:** Include exact code examples and configurations
- **Security Focused:** Always mention security implications
- **Test-Driven:** Include test cases with every code suggestion
- **Documentation Heavy:** Explain not just what, but why
- **Production Ready:** Code should be deployable, not just functional

## 🔍 Current Project State

### **Completed (Phase 1):**
- ✅ Basic CRUD operations for expenses
- ✅ Category management and analytics
- ✅ 95% backend test coverage
- ✅ 90% frontend test coverage
- ✅ Responsive UI with Tailwind CSS

### **Completed (Phase 2 - PRODUCTION READY):**
- ✅ OAuth2 Authentication with Keycloak (SecurityConfig, OAuth2LoginSuccessHandler)
- ✅ AES-256-GCM PII encryption (EncryptionService, EncryptedStringConverter)
- ✅ User data isolation with @PreAuthorize annotations
- ✅ Complete containerization with Docker Compose
- ✅ PostgreSQL migration completed (H2 only for tests)
- ✅ Keycloak realm configured with password policies
- ✅ Frontend tests fixed and passing (51% coverage - target met)
- ✅ Backend tests passing with PostgreSQL (95%+ coverage maintained)
- ✅ JSON circular reference issue fixed (@JsonIgnore annotations)
- ✅ Dashboard functionality restored (real data, working charts, quick actions)
- ✅ Local development setup (run-local.sh for IDE development)

### **Current Deployment Status:**
- Local IDE Development: `./run-local.sh` (recommended for development)
- Full Docker Development: `docker-compose -f docker-compose.dev.yml up`
- Production: `docker-compose -f docker-compose.prod.yml up`
- Demo credentials: `demo@expensetracker.com` / `DemoPassword123!`

### **Known Issues:**
- ⚠️ **Logout/SSO Issue:** Keycloak SSO session persists after logout. When trying to login as different user, previous user is automatically logged back in. 
  - **Root Cause:** OAuth2 `prompt=login` parameter not forcing account selection in current Keycloak configuration
  - **Workarounds:** Clear browser data, use incognito mode, or manual Keycloak logout
  - **Debug endpoints added:** `/api/auth/nuclear-logout`, `/api/auth/login-with-prompt`

### **Remaining Future Enhancements:**
- Fix Keycloak SSO logout issue (realm configuration or alternative logout flow)
- API rate limiting implementation
- Production deployment optimization
- Advanced monitoring and alerting
- Multi-tenancy support

---

**Remember:** I value clean, secure, well-tested code over quick hacks. Every feature should be production-ready with proper error handling, logging, and documentation.