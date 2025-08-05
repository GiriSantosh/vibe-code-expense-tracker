package com.expensetracker.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;
import java.util.logging.Logger;

@Service
public class KeycloakAdminService {

    private static final Logger logger = Logger.getLogger(KeycloakAdminService.class.getName());

    @Value("${keycloak.auth-server-url:http://localhost:8081}")
    private String keycloakUrl;

    @Value("${keycloak.admin.username:admin}")
    private String adminUsername;

    @Value("${keycloak.admin.password:admin}")
    private String adminPassword;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Terminates the user's Keycloak session using admin API
     */
    public boolean terminateUserSession(Authentication authentication) {
        try {
            if (authentication != null && authentication.getPrincipal() instanceof OidcUser) {
                OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
                
                // Get session state from OIDC user
                String sessionState = (String) oidcUser.getAttributes().get("session_state");
                String userId = oidcUser.getSubject();
                
                // Get admin access token
                String adminToken = getAdminAccessToken();
                if (adminToken == null) {
                    return false;
                }
                
                // Try to terminate session by session state first
                if (sessionState != null && terminateSessionBySessionId(adminToken, sessionState)) {
                    return true;
                }
                
                // Fallback: terminate all user sessions
                if (userId != null && terminateAllUserSessions(adminToken, userId)) {
                    return true;
                }
            }
        } catch (Exception e) {
            // Silent fail - log only in debug mode if needed
        }
        
        return false;
    }

    /**
     * Get admin access token for Keycloak admin API calls
     */
    private String getAdminAccessToken() {
        try {
            String tokenUrl = keycloakUrl + "/realms/master/protocol/openid-connect/token";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("grant_type", "password");
            body.add("client_id", "admin-cli");
            body.add("username", adminUsername);
            body.add("password", adminPassword);
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            ResponseEntity<Map> response = restTemplate.postForEntity(tokenUrl, request, Map.class);
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return (String) response.getBody().get("access_token");
            }
            
        } catch (Exception e) {
            logger.severe("Failed to get admin access token: " + e.getMessage());
        }
        
        return null;
    }

    /**
     * Terminate session by session ID (direct approach like manual logout)
     */
    private boolean terminateSessionBySessionId(String adminToken, String sessionId) {
        try {
            String sessionUrl = keycloakUrl + "/admin/realms/expense-tracker/sessions/" + sessionId;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            logger.info("DELETE request to: " + sessionUrl);
            ResponseEntity<Void> response = restTemplate.exchange(sessionUrl, HttpMethod.DELETE, request, Void.class);
            
            boolean success = response.getStatusCode().is2xxSuccessful();
            logger.info("Session termination by session ID response: " + response.getStatusCode());
            
            return success;
            
        } catch (Exception e) {
            logger.severe("Failed to terminate session by session ID: " + e.getMessage());
            return false;
        }
    }

    /**
     * Terminate all sessions for a specific user (fallback approach)
     */
    private boolean terminateAllUserSessions(String adminToken, String userId) {
        try {
            String userSessionsUrl = keycloakUrl + "/admin/realms/expense-tracker/users/" + userId + "/logout";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            logger.info("POST request to: " + userSessionsUrl);
            ResponseEntity<Void> response = restTemplate.postForEntity(userSessionsUrl, request, Void.class);
            
            boolean success = response.getStatusCode().is2xxSuccessful();
            logger.info("User sessions termination response: " + response.getStatusCode());
            
            return success;
            
        } catch (Exception e) {
            logger.severe("Failed to terminate user sessions: " + e.getMessage());
            return false;
        }
    }

    /**
     * List all active sessions for debugging
     */
    public void listActiveSessions() {
        try {
            String adminToken = getAdminAccessToken();
            if (adminToken == null) return;
            
            String sessionsUrl = keycloakUrl + "/admin/realms/expense-tracker/client-session-stats";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(adminToken);
            
            HttpEntity<Void> request = new HttpEntity<>(headers);
            
            ResponseEntity<List> response = restTemplate.exchange(sessionsUrl, HttpMethod.GET, request, List.class);
            
            if (response.getStatusCode().is2xxSuccessful()) {
                logger.info("Active sessions: " + response.getBody());
            }
            
        } catch (Exception e) {
            logger.warning("Failed to list active sessions: " + e.getMessage());
        }
    }
}