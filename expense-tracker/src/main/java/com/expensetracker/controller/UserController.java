package com.expensetracker.controller;

import com.expensetracker.dto.UserDTO;
import com.expensetracker.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "${cors.allowed-origins}")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserDTO> getCurrentUser(Authentication authentication) {
        try {
            UserDTO user = userService.getCurrentUser(authentication);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/debug-auth")
    public ResponseEntity<?> debugAuth(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.ok().body("{\"status\":\"no_auth\",\"message\":\"No authentication found\"}");
        }
        
        return ResponseEntity.ok().body(String.format(
            "{\"status\":\"authenticated\",\"name\":\"%s\",\"authorities\":\"%s\",\"principal\":\"%s\"}", 
            authentication.getName(),
            authentication.getAuthorities(),
            authentication.getPrincipal().getClass().getSimpleName()
        ));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserDTO> updateCurrentUser(
            @RequestBody UserDTO userDTO, 
            Authentication authentication) {
        try {
            UserDTO updatedUser = userService.updateUserProfile(authentication, userDTO);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/me/preferences")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserDTO.UserPreferencesDTO> getUserPreferences(Authentication authentication) {
        try {
            UserDTO user = userService.getCurrentUser(authentication);
            return ResponseEntity.ok(user.getPreferences());
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/me/preferences")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN')")
    public ResponseEntity<UserDTO.UserPreferencesDTO> updateUserPreferences(
            @RequestBody UserDTO.UserPreferencesDTO preferencesDTO,
            Authentication authentication) {
        try {
            UserDTO userDTO = new UserDTO();
            userDTO.setPreferences(preferencesDTO);
            
            UserDTO updatedUser = userService.updateUserProfile(authentication, userDTO);
            return ResponseEntity.ok(updatedUser.getPreferences());
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}