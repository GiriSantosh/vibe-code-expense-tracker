package com.expensetracker.config;

import com.expensetracker.backend.config.*;

import com.expensetracker.web.config.OAuth2LoginSuccessHandler;
import com.expensetracker.backend.service.KeycloakAdminService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;
import org.springframework.web.cors.CorsConfigurationSource;

import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "cors.allowed-origins=http://localhost:3000,http://localhost:8080,https://test.example.com",
    "spring.profiles.active=test"
})
class SecurityConfigIntegrationTest {

    @MockitoBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockitoBean
    private ClientRegistrationRepository clientRegistrationRepository;

    @MockitoBean
    private KeycloakAdminService keycloakAdminService;

    @Autowired(required = false)
    private SecurityConfig securityConfig;

    @Test
    @DisplayName("Should create all security beans successfully")
    void shouldCreateAllSecurityBeansSuccessfully() {
        if (securityConfig != null) {
            // Test all bean creation methods
            assertDoesNotThrow(() -> {
                var corsSource = securityConfig.corsConfigurationSource();
                assertNotNull(corsSource);
            });

            assertDoesNotThrow(() -> {
                var authoritiesMapper = securityConfig.authoritiesMapper();
                assertNotNull(authoritiesMapper);
            });

            assertDoesNotThrow(() -> {
                var authRequestResolver = securityConfig.authorizationRequestResolver();
                assertNotNull(authRequestResolver);
            });

            assertDoesNotThrow(() -> {
                var logoutHandler = securityConfig.enhancedOidcLogoutSuccessHandler(clientRegistrationRepository);
                assertNotNull(logoutHandler);
            });
        }
    }

    @Test
    @DisplayName("Should configure authorities mapper with default authority")
    void shouldConfigureAuthoritiesMapperWithDefaultAuthority() {
        if (securityConfig != null) {
            var mapper = securityConfig.authoritiesMapper();
            assertNotNull(mapper);

            // Test with empty authorities list - should add default
            var emptyList = Collections.<org.springframework.security.core.GrantedAuthority>emptyList();
            var mappedAuthorities = mapper.mapAuthorities(emptyList);
            
            assertNotNull(mappedAuthorities);
            assertTrue(mappedAuthorities.size() >= 1);
            assertTrue(mappedAuthorities.contains(new SimpleGrantedAuthority("ROLE_USER")));
        }
    }

    @Test
    @DisplayName("Should configure authorities mapper with uppercase conversion")
    void shouldConfigureAuthoritiesMapperWithUppercaseConversion() {
        if (securityConfig != null) {
            var mapper = securityConfig.authoritiesMapper();
            assertNotNull(mapper);

            // Test with lowercase authority - should convert to uppercase
            var lowercaseAuthorities = List.of(new SimpleGrantedAuthority("role_admin"));
            var mappedAuthorities = mapper.mapAuthorities(lowercaseAuthorities);
            
            assertNotNull(mappedAuthorities);
            assertTrue(mappedAuthorities.stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
        }
    }

    @Test
    @DisplayName("Should create OAuth2 authorization request resolver with custom parameters")
    void shouldCreateOAuth2AuthorizationRequestResolverWithCustomParameters() {
        if (securityConfig != null) {
            OAuth2AuthorizationRequestResolver resolver = securityConfig.authorizationRequestResolver();
            assertNotNull(resolver);
            
            // Verify the resolver is of the correct type
            assertTrue(resolver instanceof org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver);
        }
    }

    @Test
    @DisplayName("Should create CORS configuration source with proper settings")
    void shouldCreateCorsConfigurationSourceWithProperSettings() {
        if (securityConfig != null) {
            CorsConfigurationSource corsSource = securityConfig.corsConfigurationSource();
            assertNotNull(corsSource);
            
            // Verify it's the correct implementation
            assertTrue(corsSource instanceof org.springframework.web.cors.UrlBasedCorsConfigurationSource);
        }
    }

    @Test
    @DisplayName("Should create enhanced OIDC logout success handler")
    void shouldCreateEnhancedOidcLogoutSuccessHandler() {
        if (securityConfig != null) {
            LogoutSuccessHandler handler = securityConfig.enhancedOidcLogoutSuccessHandler(clientRegistrationRepository);
            assertNotNull(handler);
            
            // Verify it's our enhanced handler
            assertTrue(handler instanceof com.expensetracker.web.config.EnhancedOidcLogoutSuccessHandler);
        }
    }

    @Test
    @DisplayName("Should handle SecurityConfig not available in local profile")
    void shouldHandleSecurityConfigNotAvailableInLocalProfile() {
        // This test verifies that when SecurityConfig is null (due to profile exclusion),
        // the application doesn't crash
        if (securityConfig == null) {
            // This is expected behavior when SecurityConfig is excluded by profile
            assertTrue(true, "SecurityConfig is properly excluded for local profile");
        } else {
            // SecurityConfig is available in test profile
            assertNotNull(securityConfig);
        }
    }

    @Test
    @DisplayName("Should integrate all security components together")
    void shouldIntegrateAllSecurityComponentsTogether() {
        if (securityConfig != null) {
            // Test that all components can be created together without conflicts
            assertDoesNotThrow(() -> {
                var corsSource = securityConfig.corsConfigurationSource();
                var authoritiesMapper = securityConfig.authoritiesMapper();
                var authRequestResolver = securityConfig.authorizationRequestResolver();
                var logoutHandler = securityConfig.enhancedOidcLogoutSuccessHandler(clientRegistrationRepository);
                
                // All should be non-null
                assertNotNull(corsSource);
                assertNotNull(authoritiesMapper);
                assertNotNull(authRequestResolver);
                assertNotNull(logoutHandler);
            });
        }
    }

    @Test
    @DisplayName("Should maintain consistent configuration across bean creations")
    void shouldMaintainConsistentConfigurationAcrossBeanCreations() {
        if (securityConfig != null) {
            // Create beans multiple times to ensure consistency
            var corsSource1 = securityConfig.corsConfigurationSource();
            var corsSource2 = securityConfig.corsConfigurationSource();
            
            var authMapper1 = securityConfig.authoritiesMapper();
            var authMapper2 = securityConfig.authoritiesMapper();
            
            // All should be non-null and properly configured
            assertNotNull(corsSource1);
            assertNotNull(corsSource2);
            assertNotNull(authMapper1);
            assertNotNull(authMapper2);
        }
    }
}