package com.expensetracker.config;

import com.expensetracker.security.OAuth2LoginSuccessHandler;
import com.expensetracker.security.EnhancedOidcLogoutSuccessHandler;
import com.expensetracker.service.KeycloakAdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.mapping.GrantedAuthoritiesMapper;
import org.springframework.security.core.authority.mapping.SimpleAuthorityMapper;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.logout.LogoutSuccessHandler;
import org.springframework.security.web.csrf.CookieCsrfTokenRepository;
import org.springframework.security.web.csrf.CsrfTokenRequestAttributeHandler;
import org.springframework.security.oauth2.client.web.DefaultOAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.web.OAuth2AuthorizationRequestResolver;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.HttpServletRequest;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity(prePostEnabled = true)
@Profile("!local")
public class SecurityConfig {

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Autowired
    private OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Autowired
    private ClientRegistrationRepository clientRegistrationRepository;

    @Autowired
    private KeycloakAdminService keycloakAdminService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .csrf(csrf -> csrf
                        .csrfTokenRepository(CookieCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new CsrfTokenRequestAttributeHandler())
                        .ignoringRequestMatchers(
                                "/oauth2/**", 
                                "/login/oauth2/**", 
                                "/api/auth/**",
                                "/actuator/health"
                        )
                )
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers("/", "/login**", "/error**", "/oauth2/**").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/actuator/health").permitAll()
                        .anyRequest().authenticated()
                )
                .sessionManagement(session -> session
                        .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED)
                        .maximumSessions(1)
                        .maxSessionsPreventsLogin(false)
                )
                .oauth2Login(oauth2 -> oauth2
                        .defaultSuccessUrl("http://localhost:3000/", true)
                        .successHandler(oAuth2LoginSuccessHandler)
                        .failureUrl("/login?error")
                        .authorizationEndpoint(authorization -> authorization
                                .authorizationRequestResolver(authorizationRequestResolver())
                        )
                )
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authEx) -> {
                            if (request.getRequestURI().startsWith("/api/")) {
                                response.setStatus(401);
                                response.setContentType("application/json");
                                response.getWriter().write("{\"error\":\"Unauthorized\",\"message\":\"Please authenticate via OAuth2\"}");
                            } else {
                                response.sendRedirect("/oauth2/authorization/keycloak");
                            }
                        })
                )
                .logout(logout -> logout
                        .logoutUrl("/logout")
                        .logoutSuccessHandler(enhancedOidcLogoutSuccessHandler(clientRegistrationRepository))
                        .invalidateHttpSession(true)
                        .clearAuthentication(true)
                        .deleteCookies(
                                "JSESSIONID", "KEYCLOAK_SESSION", "KEYCLOAK_IDENTITY",
                                "KEYCLOAK_REMEMBER_ME", "AUTH_SESSION_ID", "KC_RESTART"
                        )
                );
        return http.build();
    }

    @Bean
    public OAuth2AuthorizationRequestResolver authorizationRequestResolver() {
        DefaultOAuth2AuthorizationRequestResolver authorizationRequestResolver =
                new DefaultOAuth2AuthorizationRequestResolver(clientRegistrationRepository, "/oauth2/authorization");
        authorizationRequestResolver.setAuthorizationRequestCustomizer(customizer -> {
            Map<String, Object> additionalParameters = new HashMap<>();
            // Force re-authentication - user will see login screen even if SSO session exists
            additionalParameters.put("prompt", "login");
            // Force fresh authentication - no cached credentials
            additionalParameters.put("max_age", "0");
            // Force account selection to bypass SSO
            additionalParameters.put("kc_idp_hint", "oidc");
            // Additional parameter to force re-authentication
            additionalParameters.put("login_hint", "");
            customizer.additionalParameters(additionalParameters);
        });
        return authorizationRequestResolver;
    }

    @Bean
    public GrantedAuthoritiesMapper authoritiesMapper() {
        SimpleAuthorityMapper authorityMapper = new SimpleAuthorityMapper();
        authorityMapper.setConvertToUpperCase(true);
        authorityMapper.setDefaultAuthority("ROLE_USER");
        return authorityMapper;
    }

    @Bean
    public LogoutSuccessHandler enhancedOidcLogoutSuccessHandler(ClientRegistrationRepository clientRegistrationRepository) {
        return new EnhancedOidcLogoutSuccessHandler(clientRegistrationRepository, keycloakAdminService);
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // Specify exact headers instead of wildcard for security
        configuration.setAllowedHeaders(Arrays.asList(
                "Content-Type", 
                "Authorization", 
                "X-Requested-With", 
                "Accept",
                "Origin",
                "X-CSRF-TOKEN"
        ));
        configuration.setAllowCredentials(true);
        // Expose CSRF token for frontend consumption
        configuration.setExposedHeaders(Arrays.asList("X-CSRF-TOKEN"));
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
