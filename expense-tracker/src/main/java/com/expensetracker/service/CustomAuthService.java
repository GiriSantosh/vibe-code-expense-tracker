package com.expensetracker.service;

import com.expensetracker.dto.LoginRequest;
import com.expensetracker.dto.SignupRequest;
import com.expensetracker.dto.AuthResponse;
import com.expensetracker.dto.UserResponse;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.Cookie;
import java.util.*;

@Service
public class CustomAuthService {

    @Value("${keycloak.auth-server-url:http://localhost:8081}")
    private String keycloakAuthServerUrl;

    @Value("${keycloak.realm:expense-tracker}")
    private String keycloakRealm;

    @Value("${keycloak.client-id:expense-tracker-backend}")
    private String keycloakClientId;

    @Value("${keycloak.client-secret:6kcwPFNSwgztS4rn3cSuK6aHWt44YkaG}")
    private String keycloakClientSecret;

    @Autowired
    private KeycloakAdminService keycloakAdminService;

    @Autowired
    private UserService userService;

    private final RestTemplate restTemplate = new RestTemplate();

    public AuthResponse authenticateUser(LoginRequest request, HttpServletResponse response) throws Exception {
        try {
            // Debug logging for Phase 4 troubleshooting
            System.out.println("DEBUG: keycloakAuthServerUrl = " + keycloakAuthServerUrl);
            System.out.println("DEBUG: keycloakRealm = " + keycloakRealm);
            System.out.println("DEBUG: keycloakClientId = " + keycloakClientId);
            System.out.println("DEBUG: keycloakClientSecret = " + (keycloakClientSecret != null ? keycloakClientSecret.substring(0, 8) + "..." : "null"));
            
            // Step 1: Authenticate with Keycloak using Resource Owner Password Credentials flow
            String tokenEndpoint = keycloakAuthServerUrl + "/realms/" + keycloakRealm + "/protocol/openid-connect/token";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "password");
            params.add("client_id", keycloakClientId);
            if (keycloakClientSecret != null && !keycloakClientSecret.isEmpty()) {
                params.add("client_secret", keycloakClientSecret);
            }
            params.add("username", request.getEmail());
            params.add("password", request.getPassword());
            params.add("scope", "openid profile email");

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
            
            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                tokenEndpoint, 
                HttpMethod.POST, 
                entity, 
                Map.class
            );

            if (tokenResponse.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Authentication failed");
            }

            Map<String, Object> tokenData = tokenResponse.getBody();
            String accessToken = (String) tokenData.get("access_token");
            String refreshToken = (String) tokenData.get("refresh_token");
            Integer expiresIn = (Integer) tokenData.get("expires_in");

            // Step 2: Get user info from token
            Map<String, Object> userInfo = getUserInfoFromToken(accessToken);
            
            // Step 3: Create/update user in local database
            var user = userService.findOrCreateUserFromKeycloak(userInfo);

            // Step 4: Create/update user in local database (for user management)
            // Note: In stateless mode, no authentication context is set here
            // Authentication happens per-request via JWT filter

            // Step 5: Set secure cookies if remember me is enabled
            if (request.isRememberMe()) {
                setSecureCookies(response, accessToken, refreshToken, expiresIn);
            }

            return AuthResponse.builder()
                .success(true)
                .message("Authentication successful")
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .expiresIn(expiresIn.longValue())
                .user(AuthResponse.UserInfo.builder()
                    .id((String) userInfo.get("sub"))
                    .email((String) userInfo.get("email"))
                    .firstName((String) userInfo.get("given_name"))
                    .lastName((String) userInfo.get("family_name"))
                    .displayName((String) userInfo.get("name"))
                    .build())
                .build();

        } catch (Exception e) {
            throw new RuntimeException("Authentication failed: " + e.getMessage());
        }
    }

    public AuthResponse registerUser(SignupRequest request, HttpServletResponse response) throws Exception {
        try {
            // Step 1: Create user in Keycloak via Admin API
            String userId = keycloakAdminService.createUser(
                request.getEmail(),
                request.getPassword(),
                request.getFirstName(),
                request.getLastName()
            );

            // Step 2: Authenticate the newly created user
            LoginRequest loginRequest = new LoginRequest();
            loginRequest.setEmail(request.getEmail());
            loginRequest.setPassword(request.getPassword());
            loginRequest.setRememberMe(false);

            // Call the updated authenticateUser method
            return authenticateUser(loginRequest, response);

        } catch (Exception e) {
            throw new RuntimeException("Registration failed: " + e.getMessage());
        }
    }

    public UserResponse getCurrentUser(Authentication authentication) throws Exception {
        try {
            if (authentication == null || !authentication.isAuthenticated()) {
                throw new RuntimeException("User not authenticated");
            }

            if (authentication.getPrincipal() instanceof OidcUser) {
                OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
                return UserResponse.builder()
                    .success(true)
                    .message("User retrieved successfully")
                    .id(oidcUser.getSubject())
                    .email(oidcUser.getEmail())
                    .firstName(oidcUser.getGivenName())
                    .lastName(oidcUser.getFamilyName())
                    .displayName(oidcUser.getFullName())
                    .emailVerified(oidcUser.getEmailVerified())
                    .build();
            }

            throw new RuntimeException("Invalid authentication type");

        } catch (Exception e) {
            throw new RuntimeException("Failed to get user info: " + e.getMessage());
        }
    }

    public boolean validateToken(Authentication authentication) {
        return authentication != null && authentication.isAuthenticated();
    }

    public AuthResponse refreshToken(HttpServletRequest request, HttpServletResponse response) throws Exception {
        try {
            // Get refresh token from cookies or request
            String refreshToken = getRefreshTokenFromRequest(request);
            if (refreshToken == null) {
                throw new RuntimeException("No refresh token available");
            }

            // Call Keycloak token refresh endpoint
            String tokenEndpoint = keycloakAuthServerUrl + "/realms/" + keycloakRealm + "/protocol/openid-connect/token";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> params = new LinkedMultiValueMap<>();
            params.add("grant_type", "refresh_token");
            params.add("client_id", keycloakClientId);
            if (keycloakClientSecret != null && !keycloakClientSecret.isEmpty()) {
                params.add("client_secret", keycloakClientSecret);
            }
            params.add("refresh_token", refreshToken);

            HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(params, headers);
            
            ResponseEntity<Map> tokenResponse = restTemplate.exchange(
                tokenEndpoint, 
                HttpMethod.POST, 
                entity, 
                Map.class
            );

            if (tokenResponse.getStatusCode() != HttpStatus.OK) {
                throw new RuntimeException("Token refresh failed");
            }

            Map<String, Object> tokenData = tokenResponse.getBody();
            String newAccessToken = (String) tokenData.get("access_token");
            String newRefreshToken = (String) tokenData.get("refresh_token");
            Integer expiresIn = (Integer) tokenData.get("expires_in");

            // Update cookies
            setSecureCookies(response, newAccessToken, newRefreshToken, expiresIn);

            return AuthResponse.builder()
                .success(true)
                .message("Token refreshed successfully")
                .accessToken(newAccessToken)
                .refreshToken(newRefreshToken)
                .expiresIn(expiresIn.longValue())
                .build();

        } catch (Exception e) {
            throw new RuntimeException("Token refresh failed: " + e.getMessage());
        }
    }

    public void performNuclearLogout(HttpServletRequest request, HttpServletResponse response) throws Exception {
        // Clear Spring Security context
        SecurityContextHolder.clearContext();
        
        // Invalidate session
        if (request.getSession(false) != null) {
            request.getSession().invalidate();
        }
        
        // Clear all authentication cookies
        clearAuthCookies(response);
    }

    private Map<String, Object> getUserInfoFromToken(String accessToken) throws Exception {
        String userInfoEndpoint = keycloakAuthServerUrl + "/realms/" + keycloakRealm + "/protocol/openid-connect/userinfo";
        
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        
        HttpEntity<String> entity = new HttpEntity<>(headers);
        
        ResponseEntity<Map> userInfoResponse = restTemplate.exchange(
            userInfoEndpoint, 
            HttpMethod.GET, 
            entity, 
            Map.class
        );

        if (userInfoResponse.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Failed to get user info");
        }

        return userInfoResponse.getBody();
    }

    // Removed setAuthenticationContext method - no longer needed in stateless mode
    // Authentication now happens per-request via JwtAuthenticationFilter

    private void setSecureCookies(HttpServletResponse response, String accessToken, String refreshToken, Integer expiresIn) {
        // Set secure HTTP-only cookies
        Cookie accessCookie = new Cookie("access_token", accessToken);
        accessCookie.setHttpOnly(true);
        accessCookie.setSecure(false); // Set to true in production with HTTPS
        accessCookie.setPath("/");
        accessCookie.setMaxAge(expiresIn);
        response.addCookie(accessCookie);

        if (refreshToken != null) {
            Cookie refreshCookie = new Cookie("refresh_token", refreshToken);
            refreshCookie.setHttpOnly(true);
            refreshCookie.setSecure(false); // Set to true in production with HTTPS
            refreshCookie.setPath("/");
            refreshCookie.setMaxAge(30 * 24 * 60 * 60); // 30 days
            response.addCookie(refreshCookie);
        }
    }

    private String getRefreshTokenFromRequest(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refresh_token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
    }

    private void clearAuthCookies(HttpServletResponse response) {
        String[] cookiesToClear = {
            "access_token", "refresh_token", "JSESSIONID", 
            "KEYCLOAK_SESSION", "KEYCLOAK_IDENTITY", 
            "KEYCLOAK_REMEMBER_ME", "AUTH_SESSION_ID", "KC_RESTART"
        };
        
        for (String cookieName : cookiesToClear) {
            Cookie cookie = new Cookie(cookieName, null);
            cookie.setPath("/");
            cookie.setMaxAge(0);
            response.addCookie(cookie);
        }
    }
}