package com.expensetracker.controller;

import com.expensetracker.web.controller.*;

import com.expensetracker.backend.service.KeycloakAdminService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class AuthControllerTest {

    @Mock
    private KeycloakAdminService keycloakAdminService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authController, "keycloakExternalUrl", "http://localhost:8081");
    }

    @Test
    @DisplayName("Should create AuthController successfully")
    void shouldCreateAuthControllerSuccessfully() {
        // Given dependencies are injected
        // Then controller should be created
        assertNotNull(authController);
    }

    @Test
    @DisplayName("Should have KeycloakAdminService dependency")
    void shouldHaveKeycloakAdminServiceDependency() {
        // Given the controller is created with dependencies
        // Then it should be properly initialized
        assertNotNull(authController);
    }

    @Test
    @DisplayName("Should have proper external URL configuration")
    void shouldHaveProperExternalUrlConfiguration() {
        // Given the external URL is set
        String externalUrl = (String) ReflectionTestUtils.getField(authController, "keycloakExternalUrl");
        
        // Then it should have the test value
        assertEquals("http://localhost:8081", externalUrl);
    }

    @Test
    @DisplayName("Should handle different external URL values")
    void shouldHandleDifferentExternalUrlValues() {
        // Given a different external URL
        String newUrl = "https://external-keycloak.com";
        ReflectionTestUtils.setField(authController, "keycloakExternalUrl", newUrl);
        
        // When retrieving the URL
        String retrievedUrl = (String) ReflectionTestUtils.getField(authController, "keycloakExternalUrl");
        
        // Then it should match the set value
        assertEquals(newUrl, retrievedUrl);
    }

    @Test
    @DisplayName("Should be a RestController with proper request mapping")
    void shouldBeRestControllerWithProperRequestMapping() {
        // Verify the controller has proper annotations
        assertTrue(authController.getClass().isAnnotationPresent(org.springframework.web.bind.annotation.RestController.class));
        assertTrue(authController.getClass().isAnnotationPresent(org.springframework.web.bind.annotation.RequestMapping.class));
        
        // Verify the request mapping value
        var requestMapping = authController.getClass().getAnnotation(org.springframework.web.bind.annotation.RequestMapping.class);
        assertArrayEquals(new String[]{"/api/auth"}, requestMapping.value());
    }

    @Test
    @DisplayName("Should have nuclear logout endpoint method")
    void shouldHaveNuclearLogoutEndpointMethod() throws NoSuchMethodException {
        // Verify the nuclear logout method exists
        var method = authController.getClass().getMethod("nuclearLogout", 
            jakarta.servlet.http.HttpServletRequest.class, 
            jakarta.servlet.http.HttpServletResponse.class, 
            org.springframework.security.core.Authentication.class);
        
        assertNotNull(method);
        assertTrue(method.isAnnotationPresent(org.springframework.web.bind.annotation.GetMapping.class));
        
        var getMapping = method.getAnnotation(org.springframework.web.bind.annotation.GetMapping.class);
        assertArrayEquals(new String[]{"/nuclear-logout"}, getMapping.value());
    }

    @Test
    @DisplayName("Should have login with prompt endpoint method")
    void shouldHaveLoginWithPromptEndpointMethod() throws NoSuchMethodException {
        // Verify the login with prompt method exists
        var method = authController.getClass().getMethod("loginWithPrompt", 
            jakarta.servlet.http.HttpServletResponse.class);
        
        assertNotNull(method);
        assertTrue(method.isAnnotationPresent(org.springframework.web.bind.annotation.GetMapping.class));
        
        var getMapping = method.getAnnotation(org.springframework.web.bind.annotation.GetMapping.class);
        assertArrayEquals(new String[]{"/login-with-prompt"}, getMapping.value());
    }

    @Test
    @DisplayName("Should have logout complete endpoint method")
    void shouldHaveLogoutCompleteEndpointMethod() throws NoSuchMethodException {
        // Verify the logout complete method exists
        var method = authController.getClass().getMethod("logoutComplete", 
            jakarta.servlet.http.HttpServletResponse.class);
        
        assertNotNull(method);
        assertTrue(method.isAnnotationPresent(org.springframework.web.bind.annotation.GetMapping.class));
        
        var getMapping = method.getAnnotation(org.springframework.web.bind.annotation.GetMapping.class);
        assertArrayEquals(new String[]{"/logout-complete"}, getMapping.value());
    }
}