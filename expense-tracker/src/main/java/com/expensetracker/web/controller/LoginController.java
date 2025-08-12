package com.expensetracker.web.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
public class LoginController {

    @GetMapping("/login")
    @ResponseBody
    public ResponseEntity<String> loginError(@RequestParam(required = false) String error) {
        if (error != null) {
            return ResponseEntity.ok()
                .body("{\"error\":\"oauth2_login_failed\",\"message\":\"OAuth2 authentication failed. Please try again.\",\"redirect\":\"http://localhost:3000\"}");
        }
        
        // Redirect to OAuth2 login
        return ResponseEntity.status(302)
            .header("Location", "/oauth2/authorization/keycloak")
            .body("");
    }
}