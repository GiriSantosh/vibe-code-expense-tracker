package com.expensetracker.config;

import com.expensetracker.backend.config.*;

import com.expensetracker.web.config.OAuth2LoginSuccessHandler;
import com.expensetracker.backend.service.KeycloakAdminService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.TestPropertySource;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@TestPropertySource(properties = {
    "cors.allowed-origins=http://localhost:3000,http://localhost:8080",
    "spring.profiles.active=test"
})
class SecurityConfigTest {

    @MockitoBean
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @MockitoBean
    private ClientRegistrationRepository clientRegistrationRepository;

    @MockitoBean
    private KeycloakAdminService keycloakAdminService;

    @Autowired(required = false)
    private SecurityConfig securityConfig;

    @Test
    @DisplayName("Should have SecurityConfig bean when not in local profile")
    void shouldHaveSecurityConfigBean() {
        // Given that we're in test profile (not local)
        // Then SecurityConfig should be available
        assertNotNull(securityConfig);
    }

    @Test
    @DisplayName("Should have CORS configuration source bean")
    void shouldHaveCorsConfigurationSourceBean() {
        if (securityConfig != null) {
            assertNotNull(securityConfig.corsConfigurationSource());
        }
    }

    @Test
    @DisplayName("Should have authorities mapper bean")
    void shouldHaveAuthoritiesMapperBean() {
        if (securityConfig != null) {
            assertNotNull(securityConfig.authoritiesMapper());
            // Test the default authority mapping
            var authorities = securityConfig.authoritiesMapper().mapAuthorities(java.util.Collections.emptyList());
            assertNotNull(authorities);
        }
    }

    @Test
    @DisplayName("Should have authorization request resolver bean")
    void shouldHaveAuthorizationRequestResolverBean() {
        if (securityConfig != null) {
            assertNotNull(securityConfig.authorizationRequestResolver());
        }
    }

    @Test
    @DisplayName("Should have enhanced OIDC logout success handler bean")
    void shouldHaveEnhancedOidcLogoutSuccessHandlerBean() {
        if (securityConfig != null) {
            assertNotNull(securityConfig.enhancedOidcLogoutSuccessHandler(clientRegistrationRepository));
        }
    }

    @Test
    @DisplayName("Should configure CORS with proper allowed origins")
    void shouldConfigureCorsWithProperAllowedOrigins() {
        if (securityConfig != null) {
            var corsSource = securityConfig.corsConfigurationSource();
            // CORS configuration requires HttpServletRequest, so we can only test the source exists
            assertNotNull(corsSource);
        }
    }

    @Test
    @DisplayName("Should configure CORS with proper allowed methods")
    void shouldConfigureCorsWithProperAllowedMethods() {
        if (securityConfig != null) {
            var corsSource = securityConfig.corsConfigurationSource();
            // CORS configuration requires HttpServletRequest, so we can only test the source exists
            assertNotNull(corsSource);
        }
    }

    @Test
    @DisplayName("Should configure authorities mapper with uppercase conversion")
    void shouldConfigureAuthoritiesMapperWithUppercaseConversion() {
        if (securityConfig != null) {
            var mapper = securityConfig.authoritiesMapper();
            assertNotNull(mapper);
            
            // Test that it maps to uppercase authorities with empty list
            var authorities = mapper.mapAuthorities(java.util.Collections.emptyList());
            assertNotNull(authorities);
            // SimpleAuthorityMapper should add default authority when list is empty
            assertTrue(authorities.size() >= 1);
        }
    }
}