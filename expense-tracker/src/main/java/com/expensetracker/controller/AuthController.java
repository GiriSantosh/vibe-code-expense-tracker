package com.expensetracker.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Value("${keycloak.auth-server-url:http://localhost:8081}")
    private String keycloakUrl;

    @GetMapping("/nuclear-logout")
    public void nuclearLogout(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException {
        // Clear Spring Security context
        if (authentication != null) {
            new SecurityContextLogoutHandler().logout(request, response, authentication);
        }
        
        // Clear all cookies
        if (request.getCookies() != null) {
            for (var cookie : request.getCookies()) {
                var clearCookie = new jakarta.servlet.http.Cookie(cookie.getName(), null);
                clearCookie.setPath("/");
                clearCookie.setMaxAge(0);
                response.addCookie(clearCookie);
            }
        }
        
        // Redirect directly to Keycloak logout with prompt parameter
        String logoutUrl = keycloakUrl + "/realms/expense-tracker/protocol/openid-connect/logout?" +
                "post_logout_redirect_uri=http://localhost:3000/" +
                "&kc_idp_hint=oidc" +
                "&prompt=login";
        
        System.out.println("Nuclear logout - redirecting to: " + logoutUrl);
        response.sendRedirect(logoutUrl);
    }
    
    @GetMapping("/login-with-prompt")  
    public void loginWithPrompt(HttpServletResponse response) throws IOException {
        String loginUrl = "/oauth2/authorization/keycloak?prompt=login&max_age=0";
        System.out.println("Login with prompt - redirecting to: " + loginUrl);
        response.sendRedirect(loginUrl);
    }
}