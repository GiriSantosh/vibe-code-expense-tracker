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
- **Charts:** Recharts for data visualization

### **Infrastructure & Security**
- **Containerization:** Docker & Docker Compose
- **Authentication Provider:** Keycloak
- **Database:** PostgreSQL with encrypted PII fields
- **Encryption:** AES-256-GCM with proper key management

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

## 📝 Code Style & Architecture Preferences

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

### **In Progress (Phase 2):**
- 🔄 OAuth2 Authentication implementation
- 🔄 AES-256-GCM PII encryption
- 🔄 User data isolation
- 🔄 Complete containerization with Docker

### **Technical Debt to Address:**
- Migration from H2 to PostgreSQL
- Environment-specific configuration management
- Production deployment optimization
- API rate limiting implementation

---

**Remember:** I value clean, secure, well-tested code over quick hacks. Every feature should be production-ready with proper error handling, logging, and documentation.