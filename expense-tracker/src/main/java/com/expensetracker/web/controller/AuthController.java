package com.expensetracker.web.controller;

import com.expensetracker.mapper.LoginRequest;
import com.expensetracker.mapper.SignupRequest;
import com.expensetracker.mapper.AuthResponse;
import com.expensetracker.mapper.UserResponse;
import com.expensetracker.backend.service.CustomAuthService;
import com.expensetracker.backend.service.KeycloakAdminService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.io.UnsupportedEncodingException;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:3001", "http://localhost:8080"})
public class AuthController {

    @Value("${keycloak.external-url:http://localhost:8081}")
    private String keycloakExternalUrl;
    
    @Autowired
    private KeycloakAdminService keycloakAdminService;
    
    @Autowired
    private CustomAuthService customAuthService;

    // Custom Authentication Endpoints for Material-UI Frontend
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = customAuthService.authenticateUser(request, response);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                AuthResponse.builder()
                    .success(false)
                    .message("Authentication failed: " + e.getMessage())
                    .build()
            );
        }
    }

    @PostMapping("/signup")
    public ResponseEntity<AuthResponse> signup(@Valid @RequestBody SignupRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = customAuthService.registerUser(request, response);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                AuthResponse.builder()
                    .success(false)
                    .message("Registration failed: " + e.getMessage())
                    .build()
            );
        }
    }

    @GetMapping("/user")
    public ResponseEntity<UserResponse> getCurrentUser(Authentication authentication) {
        try {
            UserResponse user = customAuthService.getCurrentUser(authentication);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                UserResponse.builder()
                    .success(false)
                    .message("Failed to get user info: " + e.getMessage())
                    .build()
            );
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<AuthResponse> validateToken(HttpServletRequest request, Authentication authentication) {
        try {
            boolean isValid = customAuthService.validateToken(authentication);
            return ResponseEntity.ok(
                AuthResponse.builder()
                    .success(isValid)
                    .message(isValid ? "Token is valid" : "Token is invalid")
                    .build()
            );
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                AuthResponse.builder()
                    .success(false)
                    .message("Token validation failed: " + e.getMessage())
                    .build()
            );
        }
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(HttpServletRequest request, HttpServletResponse response) {
        try {
            AuthResponse authResponse = customAuthService.refreshToken(request, response);
            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(
                AuthResponse.builder()
                    .success(false)
                    .message("Token refresh failed: " + e.getMessage())
                    .build()
            );
        }
    }

    // Existing endpoints
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
        String logoutUrl = keycloakExternalUrl + "/realms/expense-tracker/protocol/openid-connect/logout?" +
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