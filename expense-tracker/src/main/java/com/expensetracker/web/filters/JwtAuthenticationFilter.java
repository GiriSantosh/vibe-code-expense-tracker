package com.expensetracker.web.filters;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${keycloak.auth-server-url:http://keycloak:8080}")
    private String keycloakAuthServerUrl;

    @Value("${keycloak.realm:expense-tracker}")
    private String keycloakRealm;

    private final RestTemplate restTemplate = new RestTemplate();

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, 
                                  FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // Extract Bearer token from Authorization header
            String token = extractTokenFromRequest(request);
            
            if (token != null) {
                // Validate token and set authentication
                Authentication authentication = validateTokenAndCreateAuthentication(token);
                if (authentication != null) {
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.debug("JWT authentication successful for token: " + token.substring(0, 20) + "...");
                } else {
                    logger.debug("JWT token validation failed");
                }
            } else {
                logger.debug("No Bearer token found in Authorization header");
            }
        } catch (Exception e) {
            logger.error("JWT authentication error: " + e.getMessage());
            // Continue without authentication - let Spring Security handle unauthorized access
        }

        filterChain.doFilter(request, response);
    }

    private String extractTokenFromRequest(HttpServletRequest request) {
        String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7); // Remove "Bearer " prefix
        }
        return null;
    }

    private Authentication validateTokenAndCreateAuthentication(String token) {
        try {
            // Validate token with Keycloak userinfo endpoint
            String userInfoEndpoint = keycloakAuthServerUrl + "/realms/" + keycloakRealm + "/protocol/openid-connect/userinfo";
            
            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(token);
            HttpEntity<String> entity = new HttpEntity<>(headers);
            
            ResponseEntity<Map> response = restTemplate.exchange(
                userInfoEndpoint, 
                HttpMethod.GET, 
                entity, 
                Map.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> userInfo = response.getBody();
                
                // Create authentication with user info and ROLE_USER authority
                List<SimpleGrantedAuthority> authorities = Collections.singletonList(
                    new SimpleGrantedAuthority("ROLE_USER")
                );
                
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                    userInfo.get("email"), 
                    null, 
                    authorities
                );
                authentication.setDetails(userInfo);
                
                return authentication;
            }
        } catch (Exception e) {
            logger.error("Token validation failed: " + e.getMessage());
        }
        
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        String path = request.getRequestURI();
        
        // Skip JWT filter for public endpoints
        return path.startsWith("/api/auth/") || 
               path.startsWith("/actuator/health") || 
               path.startsWith("/error") ||
               path.startsWith("/oauth2/") ||
               path.startsWith("/login");
    }
}