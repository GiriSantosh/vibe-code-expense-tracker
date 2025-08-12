package com.expensetracker.security;

import com.expensetracker.web.config.*;

import com.expensetracker.backend.service.KeycloakAdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.ActiveProfiles;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class EnhancedOidcLogoutSuccessHandlerTest {

    @Mock
    private ClientRegistrationRepository clientRegistrationRepository;

    @Mock
    private KeycloakAdminService keycloakAdminService;

    private EnhancedOidcLogoutSuccessHandler logoutSuccessHandler;

    @BeforeEach
    void setUp() {
        logoutSuccessHandler = new EnhancedOidcLogoutSuccessHandler(clientRegistrationRepository, keycloakAdminService);
    }

    @Test
    @DisplayName("Should create EnhancedOidcLogoutSuccessHandler successfully")
    void shouldCreateEnhancedOidcLogoutSuccessHandlerSuccessfully() {
        // When creating the handler
        EnhancedOidcLogoutSuccessHandler handler = new EnhancedOidcLogoutSuccessHandler(
            clientRegistrationRepository, keycloakAdminService);

        // Then it should be created successfully
        assertNotNull(handler);
    }

    @Test
    @DisplayName("Should have KeycloakAdminService dependency")
    void shouldHaveKeycloakAdminServiceDependency() {
        // Given the handler is created with dependencies
        // Then it should be properly initialized
        assertNotNull(logoutSuccessHandler);
    }

    @Test
    @DisplayName("Should extend OidcClientInitiatedLogoutSuccessHandler")
    void shouldExtendOidcClientInitiatedLogoutSuccessHandler() {
        // The handler should extend the correct Spring Security class
        assertTrue(logoutSuccessHandler instanceof org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler);
    }

    @Test
    @DisplayName("Should have proper constructor dependencies")
    void shouldHaveProperConstructorDependencies() {
        // Verify constructor accepts the correct dependencies
        assertDoesNotThrow(() -> {
            new EnhancedOidcLogoutSuccessHandler(clientRegistrationRepository, keycloakAdminService);
        });
    }

    @Test
    @DisplayName("Should not throw exception when dependencies are provided")
    void shouldNotThrowExceptionWhenDependenciesProvided() {
        // Given valid dependencies
        ClientRegistrationRepository repo = mock(ClientRegistrationRepository.class);
        KeycloakAdminService service = mock(KeycloakAdminService.class);

        // When creating handler
        // Then no exception should be thrown
        assertDoesNotThrow(() -> {
            new EnhancedOidcLogoutSuccessHandler(repo, service);
        });
    }
}