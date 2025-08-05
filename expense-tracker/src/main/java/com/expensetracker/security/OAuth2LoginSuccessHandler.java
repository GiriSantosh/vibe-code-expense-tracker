package com.expensetracker.security;

import com.expensetracker.service.UserService;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class OAuth2LoginSuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    @Autowired
    private UserService userService;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
                                      Authentication authentication) throws IOException, ServletException {
        
        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        
        // Store session information for logout
        if (authentication instanceof OAuth2AuthenticationToken) {
            OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
            
            // Store session state and other logout-relevant information
            if (oauth2User instanceof OidcUser) {
                OidcUser oidcUser = (OidcUser) oauth2User;
                
                // Store session state for logout
                String sessionState = (String) oidcUser.getAttributes().get("session_state");
                if (sessionState != null) {
                    request.getSession().setAttribute("keycloak_session_state", sessionState);
                }
                
                // Store ID token for logout
                String idToken = oidcUser.getIdToken().getTokenValue();
                if (idToken != null) {
                    request.getSession().setAttribute("keycloak_id_token", idToken);
                }
                
                // Store user subject for logout
                String subject = oidcUser.getSubject();
                if (subject != null) {
                    request.getSession().setAttribute("keycloak_subject", subject);
                }
            }
        }
        
        // Create or update user in database
        userService.createOrUpdateUser(oauth2User);
        
        // Set default redirect URL
        setDefaultTargetUrl("http://localhost:3000/dashboard");
        
        super.onAuthenticationSuccess(request, response, authentication);
    }
}