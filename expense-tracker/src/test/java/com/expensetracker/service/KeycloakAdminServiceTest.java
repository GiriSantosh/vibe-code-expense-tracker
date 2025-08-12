package com.expensetracker.service;

import com.expensetracker.backend.service.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestClientException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class KeycloakAdminServiceTest {

    @Mock
    private Authentication authentication;

    @Mock
    private OidcUser oidcUser;

    @Mock
    private RestTemplate restTemplate;

    private KeycloakAdminService keycloakAdminService;

    @BeforeEach
    void setUp() {
        keycloakAdminService = new KeycloakAdminService();
        
        // Set test values using reflection
        ReflectionTestUtils.setField(keycloakAdminService, "keycloakUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(keycloakAdminService, "adminUsername", "admin");
        ReflectionTestUtils.setField(keycloakAdminService, "adminPassword", "admin");
        ReflectionTestUtils.setField(keycloakAdminService, "restTemplate", restTemplate);
    }

    @Test
    @DisplayName("Should successfully terminate user session with session state")
    void shouldSuccessfullyTerminateUserSessionWithSessionState() {
        // Given
        when(authentication.getPrincipal()).thenReturn(oidcUser);
        when(oidcUser.getAttributes()).thenReturn(Map.of(
            "session_state", "test-session-123",
            "sub", "user-123"
        ));
        when(oidcUser.getSubject()).thenReturn("user-123");

        // Mock admin token request
        ResponseEntity<Map> tokenResponse = ResponseEntity.ok(Map.of("access_token", "admin-token-123"));
        when(restTemplate.postForEntity(eq("http://localhost:8081/realms/master/protocol/openid-connect/token"), 
            any(HttpEntity.class), eq(Map.class))).thenReturn(tokenResponse);

        // Mock session termination request
        ResponseEntity<Void> sessionResponse = ResponseEntity.ok().build();
        when(restTemplate.exchange(eq("http://localhost:8081/admin/realms/expense-tracker/sessions/test-session-123"),
            eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class))).thenReturn(sessionResponse);

        // When
        boolean result = keycloakAdminService.terminateUserSession(authentication);

        // Then
        assertTrue(result);
        verify(restTemplate, times(1)).postForEntity(anyString(), any(HttpEntity.class), eq(Map.class));
        verify(restTemplate, times(1)).exchange(anyString(), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class));
    }

    @Test
    @DisplayName("Should fallback to terminate all user sessions when session state termination fails")
    void shouldFallbackToTerminateAllUserSessionsWhenSessionStateTerminationFails() {
        // Given
        when(authentication.getPrincipal()).thenReturn(oidcUser);
        when(oidcUser.getAttributes()).thenReturn(Map.of(
            "session_state", "test-session-123",
            "sub", "user-123"
        ));
        when(oidcUser.getSubject()).thenReturn("user-123");

        // Mock admin token request
        ResponseEntity<Map> tokenResponse = ResponseEntity.ok(Map.of("access_token", "admin-token-123"));
        when(restTemplate.postForEntity(eq("http://localhost:8081/realms/master/protocol/openid-connect/token"), 
            any(HttpEntity.class), eq(Map.class))).thenReturn(tokenResponse);

        // Mock session termination request failure
        when(restTemplate.exchange(eq("http://localhost:8081/admin/realms/expense-tracker/sessions/test-session-123"),
            eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class)))
            .thenThrow(new RestClientException("Session not found"));

        // Mock user sessions termination success
        ResponseEntity<Void> userSessionsResponse = ResponseEntity.ok().build();
        when(restTemplate.postForEntity(eq("http://localhost:8081/admin/realms/expense-tracker/users/user-123/logout"),
            any(HttpEntity.class), eq(Void.class))).thenReturn(userSessionsResponse);

        // When
        boolean result = keycloakAdminService.terminateUserSession(authentication);

        // Then
        assertTrue(result);
        verify(restTemplate, times(1)).exchange(anyString(), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class));
        verify(restTemplate, times(1)).postForEntity(contains("/logout"), any(HttpEntity.class), eq(Void.class));
    }

    @Test
    @DisplayName("Should return false when admin token cannot be obtained")
    void shouldReturnFalseWhenAdminTokenCannotBeObtained() {
        // Given
        when(authentication.getPrincipal()).thenReturn(oidcUser);
        when(oidcUser.getAttributes()).thenReturn(Map.of("session_state", "test-session-123"));

        // Mock admin token request failure
        when(restTemplate.postForEntity(anyString(), any(HttpEntity.class), eq(Map.class)))
            .thenThrow(new RestClientException("Authentication failed"));

        // When
        boolean result = keycloakAdminService.terminateUserSession(authentication);

        // Then
        assertFalse(result);
        verify(restTemplate, times(1)).postForEntity(anyString(), any(HttpEntity.class), eq(Map.class));
        verify(restTemplate, never()).exchange(anyString(), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class));
    }

    @Test
    @DisplayName("Should return false when authentication is null")
    void shouldReturnFalseWhenAuthenticationNull() {
        // When
        boolean result = keycloakAdminService.terminateUserSession(null);

        // Then
        assertFalse(result);
        verify(restTemplate, never()).postForEntity(anyString(), any(HttpEntity.class), eq(Map.class));
    }

    @Test
    @DisplayName("Should return false when authentication principal is not OidcUser")
    void shouldReturnFalseWhenAuthenticationPrincipalNotOidcUser() {
        // Given
        Object nonOidcPrincipal = new Object();
        when(authentication.getPrincipal()).thenReturn(nonOidcPrincipal);

        // When
        boolean result = keycloakAdminService.terminateUserSession(authentication);

        // Then
        assertFalse(result);
        verify(restTemplate, never()).postForEntity(anyString(), any(HttpEntity.class), eq(Map.class));
    }

    @Test
    @DisplayName("Should handle missing session state gracefully")
    void shouldHandleMissingSessionStateGracefully() {
        // Given
        when(authentication.getPrincipal()).thenReturn(oidcUser);
        when(oidcUser.getAttributes()).thenReturn(Map.of("sub", "user-123"));
        when(oidcUser.getSubject()).thenReturn("user-123");

        // Mock admin token request
        ResponseEntity<Map> tokenResponse = ResponseEntity.ok(Map.of("access_token", "admin-token-123"));
        when(restTemplate.postForEntity(eq("http://localhost:8081/realms/master/protocol/openid-connect/token"), 
            any(HttpEntity.class), eq(Map.class))).thenReturn(tokenResponse);

        // Mock user sessions termination success
        ResponseEntity<Void> userSessionsResponse = ResponseEntity.ok().build();
        when(restTemplate.postForEntity(eq("http://localhost:8081/admin/realms/expense-tracker/users/user-123/logout"),
            any(HttpEntity.class), eq(Void.class))).thenReturn(userSessionsResponse);

        // When
        boolean result = keycloakAdminService.terminateUserSession(authentication);

        // Then
        assertTrue(result);
        // Should skip session termination and go directly to user sessions termination
        verify(restTemplate, never()).exchange(anyString(), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class));
        verify(restTemplate, times(1)).postForEntity(contains("/logout"), any(HttpEntity.class), eq(Void.class));
    }

    @Test
    @DisplayName("Should handle all termination methods failing gracefully")
    void shouldHandleAllTerminationMethodsFailingGracefully() {
        // Given
        when(authentication.getPrincipal()).thenReturn(oidcUser);
        when(oidcUser.getAttributes()).thenReturn(Map.of(
            "session_state", "test-session-123",
            "sub", "user-123"
        ));
        when(oidcUser.getSubject()).thenReturn("user-123");

        // Mock admin token request success
        ResponseEntity<Map> tokenResponse = ResponseEntity.ok(Map.of("access_token", "admin-token-123"));
        when(restTemplate.postForEntity(eq("http://localhost:8081/realms/master/protocol/openid-connect/token"), 
            any(HttpEntity.class), eq(Map.class))).thenReturn(tokenResponse);

        // Mock all termination requests failing
        when(restTemplate.exchange(anyString(), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class)))
            .thenThrow(new RestClientException("Session termination failed"));
        when(restTemplate.postForEntity(contains("/logout"), any(HttpEntity.class), eq(Void.class)))
            .thenThrow(new RestClientException("User logout failed"));

        // When
        boolean result = keycloakAdminService.terminateUserSession(authentication);

        // Then
        assertFalse(result);
        verify(restTemplate, times(1)).exchange(anyString(), eq(HttpMethod.DELETE), any(HttpEntity.class), eq(Void.class));
        verify(restTemplate, times(1)).postForEntity(contains("/logout"), any(HttpEntity.class), eq(Void.class));
    }

    @Test
    @DisplayName("Should handle exceptions gracefully and return false")
    void shouldHandleExceptionsGracefullyAndReturnFalse() {
        // Given
        when(authentication.getPrincipal()).thenReturn(oidcUser);
        when(oidcUser.getAttributes()).thenThrow(new RuntimeException("Unexpected error"));

        // When
        boolean result = keycloakAdminService.terminateUserSession(authentication);

        // Then
        assertFalse(result);
        // Should not make any REST calls due to early exception
        verify(restTemplate, never()).postForEntity(anyString(), any(HttpEntity.class), eq(Map.class));
    }
}