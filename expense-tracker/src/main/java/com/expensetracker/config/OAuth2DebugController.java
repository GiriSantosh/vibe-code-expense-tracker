package com.expensetracker.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestMapping;

import java.util.Map;

@RestController
@RequestMapping("/debug")
public class OAuth2DebugController {

    @Autowired
    private OAuth2ClientProperties oauth2ClientProperties;

    @GetMapping("/oauth2-config")
    public Map<String, Object> getOAuth2Config() {
        return Map.of(
            "registrations", oauth2ClientProperties.getRegistration(),
            "providers", oauth2ClientProperties.getProvider()
        );
    }
}