package com.expensetracker.security;

import com.expensetracker.service.KeycloakAdminService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.oidc.web.logout.OidcClientInitiatedLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import java.io.IOException;

public class EnhancedOidcLogoutSuccessHandler extends OidcClientInitiatedLogoutSuccessHandler {

    private final KeycloakAdminService keycloakAdminService;

    public EnhancedOidcLogoutSuccessHandler(ClientRegistrationRepository clientRegistrationRepository, 
                                           KeycloakAdminService keycloakAdminService) {
        super(clientRegistrationRepository);
        this.keycloakAdminService = keycloakAdminService;
        setPostLogoutRedirectUri("http://localhost:3000/");
    }

    @Override
    public void onLogoutSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) 
            throws IOException, ServletException {
        
        // Step 1: Terminate Keycloak session via admin API
        if (authentication != null) {
            keycloakAdminService.terminateUserSession(authentication);
        }
        
        // Step 2: Continue with standard OIDC logout flow
        super.onLogoutSuccess(request, response, authentication);
    }
}