package com.expensetracker.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import jakarta.servlet.http.HttpSession;
import java.util.logging.Logger;

@Service
public class KeycloakLogoutService {

    private static final Logger logger = Logger.getLogger(KeycloakLogoutService.class.getName());

    @Value("${keycloak.auth-server-url:http://localhost:8081}")
    private String keycloakUrl;

    @Value("${spring.security.oauth2.client.registration.keycloak.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.keycloak.client-secret}")
    private String clientSecret;

    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Terminates the Keycloak session using multiple approaches
     */
    public boolean logoutFromKeycloak(Authentication authentication) {
        try {
            if (authentication != null && authentication.getPrincipal() instanceof OidcUser) {
                OidcUser oidcUser = (OidcUser) authentication.getPrincipal();
                
                // Try multiple logout approaches
                boolean success = false;
                
                // Approach 1: Session-based logout with stored session info
                success = performSessionBasedLogout(oidcUser);
                if (success) {
                    logger.info("Session-based logout successful");
                    return true;
                }
                
                // Approach 2: ID token based logout
                success = performIdTokenLogout(oidcUser);
                if (success) {
                    logger.info("ID token logout successful");
                    return true;
                }
                
                // Approach 3: Subject-based logout
                success = performSubjectBasedLogout(oidcUser);
                if (success) {
                    logger.info("Subject-based logout successful");
                    return true;
                }
                
                logger.warning("All logout approaches failed");
            }
        } catch (Exception e) {
            logger.severe("Error during Keycloak logout: " + e.getMessage());
        }
        
        return false;
    }

    private String getRefreshToken(OidcUser oidcUser) {
        // Try to get refresh token from user attributes
        // Note: This might need adjustment based on how tokens are stored
        Object refreshToken = oidcUser.getAttributes().get("refresh_token");
        if (refreshToken != null) {
            return refreshToken.toString();
        }
        
        // Alternative: Check if stored in session or other location
        return null;
    }

    private boolean performKeycloakLogout(String refreshToken) {
        try {
            String logoutUrl = keycloakUrl + "/realms/expense-tracker/protocol/openid-connect/logout";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            body.add("refresh_token", refreshToken);
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            logger.info("Attempting Keycloak logout with refresh token");
            ResponseEntity<String> response = restTemplate.postForEntity(logoutUrl, request, String.class);
            
            boolean success = response.getStatusCode().is2xxSuccessful();
            logger.info("Keycloak logout response: " + response.getStatusCode());
            
            return success;
            
        } catch (Exception e) {
            logger.severe("Failed to logout from Keycloak with refresh token: " + e.getMessage());
            return false;
        }
    }

    private boolean performSessionBasedLogout(OidcUser oidcUser) {
        try {
            String logoutUrl = keycloakUrl + "/realms/expense-tracker/protocol/openid-connect/logout";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            
            // Try to get session state from session storage first
            String sessionState = getFromSession("keycloak_session_state");
            if (sessionState == null) {
                // Fallback to OIDC user attributes
                sessionState = (String) oidcUser.getAttributes().get("session_state");
            }
            
            if (sessionState != null) {
                body.add("logout_hint", sessionState);
                logger.info("Using session state for logout: " + sessionState);
            }
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            logger.info("Attempting Keycloak session-based logout");
            ResponseEntity<String> response = restTemplate.postForEntity(logoutUrl, request, String.class);
            
            boolean success = response.getStatusCode().is2xxSuccessful();
            logger.info("Keycloak session logout response: " + response.getStatusCode());
            
            return success;
            
        } catch (Exception e) {
            logger.severe("Failed to logout from Keycloak with session: " + e.getMessage());
            return false;
        }
    }
    
    private boolean performIdTokenLogout(OidcUser oidcUser) {
        try {
            String logoutUrl = keycloakUrl + "/realms/expense-tracker/protocol/openid-connect/logout";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            
            // Use ID token for logout
            String idToken = getFromSession("keycloak_id_token");
            if (idToken == null && oidcUser.getIdToken() != null) {
                idToken = oidcUser.getIdToken().getTokenValue();
            }
            
            if (idToken != null) {
                body.add("id_token_hint", idToken);
                logger.info("Using ID token for logout");
            }
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            logger.info("Attempting Keycloak ID token logout");
            ResponseEntity<String> response = restTemplate.postForEntity(logoutUrl, request, String.class);
            
            boolean success = response.getStatusCode().is2xxSuccessful();
            logger.info("Keycloak ID token logout response: " + response.getStatusCode());
            
            return success;
            
        } catch (Exception e) {
            logger.severe("Failed to logout from Keycloak with ID token: " + e.getMessage());
            return false;
        }
    }
    
    private boolean performSubjectBasedLogout(OidcUser oidcUser) {
        try {
            String logoutUrl = keycloakUrl + "/realms/expense-tracker/protocol/openid-connect/logout";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("client_id", clientId);
            body.add("client_secret", clientSecret);
            
            // Use subject (user ID) for logout
            String subject = getFromSession("keycloak_subject");
            if (subject == null) {
                subject = oidcUser.getSubject();
            }
            
            if (subject != null) {
                body.add("logout_hint", subject);
                logger.info("Using subject for logout: " + subject);
            }
            
            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
            
            logger.info("Attempting Keycloak subject-based logout");
            ResponseEntity<String> response = restTemplate.postForEntity(logoutUrl, request, String.class);
            
            boolean success = response.getStatusCode().is2xxSuccessful();
            logger.info("Keycloak subject logout response: " + response.getStatusCode());
            
            return success;
            
        } catch (Exception e) {
            logger.severe("Failed to logout from Keycloak with subject: " + e.getMessage());
            return false;
        }
    }
    
    private String getFromSession(String key) {
        try {
            ServletRequestAttributes attr = (ServletRequestAttributes) RequestContextHolder.currentRequestAttributes();
            HttpSession session = attr.getRequest().getSession(false);
            if (session != null) {
                return (String) session.getAttribute(key);
            }
        } catch (Exception e) {
            logger.warning("Could not retrieve " + key + " from session: " + e.getMessage());
        }
        return null;
    }

    /**
     * Revokes all tokens for the user (more aggressive approach)
     */
    public boolean revokeAllTokens(String accessToken, String refreshToken) {
        try {
            String revokeUrl = keycloakUrl + "/realms/expense-tracker/protocol/openid-connect/revoke";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            
            // Revoke refresh token
            if (refreshToken != null) {
                MultiValueMap<String, String> refreshBody = new LinkedMultiValueMap<>();
                refreshBody.add("client_id", clientId);
                refreshBody.add("client_secret", clientSecret);
                refreshBody.add("token", refreshToken);
                refreshBody.add("token_type_hint", "refresh_token");
                
                HttpEntity<MultiValueMap<String, String>> refreshRequest = new HttpEntity<>(refreshBody, headers);
                restTemplate.postForEntity(revokeUrl, refreshRequest, String.class);
                logger.info("Revoked refresh token");
            }
            
            // Revoke access token
            if (accessToken != null) {
                MultiValueMap<String, String> accessBody = new LinkedMultiValueMap<>();
                accessBody.add("client_id", clientId);
                accessBody.add("client_secret", clientSecret);
                accessBody.add("token", accessToken);
                accessBody.add("token_type_hint", "access_token");
                
                HttpEntity<MultiValueMap<String, String>> accessRequest = new HttpEntity<>(accessBody, headers);
                restTemplate.postForEntity(revokeUrl, accessRequest, String.class);
                logger.info("Revoked access token");
            }
            
            return true;
            
        } catch (Exception e) {
            logger.severe("Failed to revoke tokens: " + e.getMessage());
            return false;
        }
    }
}