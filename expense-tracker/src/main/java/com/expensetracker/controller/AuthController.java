package com.expensetracker.controller;

import com.expensetracker.service.KeycloakAdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${keycloak.auth-server-url:http://localhost:8081}")
    private String keycloakUrl;
    
    @Autowired
    private KeycloakAdminService keycloakAdminService;

    @GetMapping("/nuclear-logout")
    public void nuclearLogout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, UnsupportedEncodingException {
        
        // Step 1: Terminate Keycloak session via admin API
        if (authentication != null) {
            keycloakAdminService.terminateUserSession(authentication);
        }
        
        // Step 2: Clear Spring Security context
        if (authentication != null) {
            new SecurityContextLogoutHandler().logout(request, response, authentication);
        }
        
        // Step 3: Clear cookies
        String[] cookiesToClear = {
            "JSESSIONID", "KEYCLOAK_SESSION", "KEYCLOAK_IDENTITY", 
            "KEYCLOAK_REMEMBER_ME", "AUTH_SESSION_ID", "KC_RESTART"
        };
        
        for (String cookieName : cookiesToClear) {
            var cookie = new jakarta.servlet.http.Cookie(cookieName, null);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);
        }
        
        // Step 4: Invalidate session
        request.getSession().invalidate();
        
        // Step 5: Direct Keycloak logout with backend redirect
        String backendRedirectUrl = "http://localhost:8080/api/auth/logout-complete";
        String logoutUrl = keycloakUrl + "/realms/expense-tracker/protocol/openid-connect/logout?" +
                "client_id=expense-tracker-backend&" +
                "post_logout_redirect_uri=" + java.net.URLEncoder.encode(backendRedirectUrl, "UTF-8");
        
        response.sendRedirect(logoutUrl);
    }
    
    @GetMapping("/login-with-prompt")  
    public void loginWithPrompt(HttpServletResponse response) throws IOException {
        String loginUrl = "/oauth2/authorization/keycloak?prompt=login&max_age=0";
        response.sendRedirect(loginUrl);
    }
    
    
    @GetMapping("/logout-complete")
    public void logoutComplete(HttpServletResponse response) throws IOException {
        response.sendRedirect("http://localhost:3000/");
    }
}