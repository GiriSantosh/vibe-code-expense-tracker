This document outlines the package structure to be used in our Spring Boot projects.
Apply only to backend project named `expense-tracker`

*   **`com.org.<projectname>`**: The root package, this could be a short meaningful name.
    *   **`backend`**: Core business logic.
        *   `config`: Backend-specific configurations.
            *   `async`: Asynchronous processing configuration.
            *   `aws`: Amazon Web Services configuration.
            *   `cache`: Caching configuration.
            *   `http`: HTTP client configuration.
            *   `jmx`: Java Management Extensions configuration.
            *   `mongo`: MongoDB configuration.
            *   `scheduler`: Scheduler configuration.
        *   `context`: Application context setup.
        *   `events`: Event handling components.
            *   `entity`: Event-related entities.
            *   `handler`: Event handlers.
            *   `publisher`: Event publishers.
        *   `exception`: Internal server errors and business logic exceptions (HTTP 5xx).
        *   `http`: HTTP client logic.
            *   `model`: HTTP request/response models.
                *   `email`: Email-related models.
        *   `jms`: Java Messaging Service related components.
        *   `log`: Logging utilities.
        *   `mongo`: MongoDB related components.
            *   `entity`: MongoDB entities.
            *   `repository`: MongoDB repositories.
                *   `impl`: Implementation of repositories.
        *   `scheduler`: Task scheduling components.
        *   `service`: Business service interfaces and implementations.
        *   `util`: Utility classes.
    *   **`main`**: Main application entry point.
    *   **`mapper`**: Data mapping classes.
    *   **`web`**: Web layer components like controller, validations etc.
        *   `config`: Web-specific configurations.
            *   `error`: Error handling configuration.
        *   `controller`: Spring MVC controllers.
        *   `exception`: Client-facing exceptions (HTTP 4xx) like ResourceNotFoundException, InvalidInputException.
        *   `filters`: Servlet filters.
        *   `validator`: Request validators.
            *   `impl`: Implementation of validators.
        *   `view`: View-related components.
            *   `event`: Event-related view models.
            *   `jms`: JMS-related view models.
            *   `response`: Response view models.
            *   `subscription`: Subscription-related view models.

You may verify the existing package and suggest a solution before applying changes to it.

## Exception Classification Guidelines

**Backend Exceptions (`backend.exception`):**
- Internal server errors (HTTP 5xx)
- Business logic failures
- Database connection issues
- External service failures

**Web Exceptions (`web.exception`):**
- Client-facing errors (HTTP 4xx)
- Resource not found (404)
- Invalid input/validation errors (400)
- Authentication/authorization errors (401/403)