package com.expensetracker.backend.service;

import com.expensetracker.mapper.UserDTO;
import com.expensetracker.model.User;
import com.expensetracker.model.UserPreferences;
import com.expensetracker.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@Service
@Transactional
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public UserDTO getCurrentUser(Authentication authentication) {
        String username = extractUsername(authentication);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        return convertToDTO(user);
    }

    public User createOrUpdateUser(OAuth2User oauth2User) {
        String username = oauth2User.getAttribute("preferred_username");
        String email = oauth2User.getAttribute("email");
        String firstName = oauth2User.getAttribute("given_name");
        String lastName = oauth2User.getAttribute("family_name");
        Boolean emailVerified = oauth2User.getAttribute("email_verified");

        Optional<User> existingUser = userRepository.findByUsername(username);
        
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setLastLoginAt(LocalDateTime.now());
            user.setEmailVerified(emailVerified != null ? emailVerified : false);
            // Update other fields if needed
            if (email != null && !email.equals(user.getEmail())) {
                user.setEmail(email);
            }
            return userRepository.save(user);
        } else {
            User newUser = new User(username, email, firstName, lastName);
            newUser.setEmailVerified(emailVerified != null ? emailVerified : false);
            newUser.setLastLoginAt(LocalDateTime.now());
            
            // Create default preferences
            UserPreferences preferences = new UserPreferences(newUser);
            newUser.setPreferences(preferences);
            
            return userRepository.save(newUser);
        }
    }

    public UserDTO updateUserProfile(Authentication authentication, UserDTO userDTO) {
        String username = extractUsername(authentication);
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Update allowed fields
        if (userDTO.getFirstName() != null) {
            user.setFirstName(userDTO.getFirstName());
        }
        if (userDTO.getLastName() != null) {
            user.setLastName(userDTO.getLastName());
        }
        
        // Update preferences if provided
        if (userDTO.getPreferences() != null && user.getPreferences() != null) {
            UserPreferences preferences = user.getPreferences();
            UserDTO.UserPreferencesDTO prefDTO = userDTO.getPreferences();
            
            if (prefDTO.getCurrency() != null) {
                preferences.setCurrency(prefDTO.getCurrency());
            }
            if (prefDTO.getDateFormat() != null) {
                preferences.setDateFormat(prefDTO.getDateFormat());
            }
            if (prefDTO.getDefaultCategory() != null) {
                preferences.setDefaultCategory(prefDTO.getDefaultCategory());
            }
            if (prefDTO.getEnableNotifications() != null) {
                preferences.setEnableNotifications(prefDTO.getEnableNotifications());
            }
            if (prefDTO.getTheme() != null) {
                preferences.setTheme(prefDTO.getTheme());
            }
        }

        User savedUser = userRepository.save(user);
        return convertToDTO(savedUser);
    }

    public User findByUsername(String username) {
        return userRepository.findByUsername(username).orElse(null);
    }

    public User findOrCreateUserFromKeycloak(Map<String, Object> userInfo) {
        String email = (String) userInfo.get("email");
        String username = (String) userInfo.get("preferred_username");
        String firstName = (String) userInfo.get("given_name");
        String lastName = (String) userInfo.get("family_name");
        Boolean emailVerified = (Boolean) userInfo.get("email_verified");
        String userId = (String) userInfo.get("sub");

        // Try to find existing user by email or username
        Optional<User> existingUser = userRepository.findByEmail(email);
        if (existingUser.isEmpty() && username != null) {
            existingUser = userRepository.findByUsername(username);
        }

        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setLastLoginAt(LocalDateTime.now());
            user.setEmailVerified(emailVerified != null ? emailVerified : false);
            return userRepository.save(user);
        } else {
            // Create new user
            User newUser = new User(username != null ? username : email, email, firstName, lastName);
            newUser.setEmailVerified(emailVerified != null ? emailVerified : false);
            newUser.setLastLoginAt(LocalDateTime.now());
            
            // Create default preferences
            UserPreferences preferences = new UserPreferences(newUser);
            newUser.setPreferences(preferences);
            
            return userRepository.save(newUser);
        }
    }

    private String extractUsername(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            return oauth2User.getAttribute("preferred_username");
        }
        return authentication.getName();
    }

    private UserDTO convertToDTO(User user) {
        UserDTO dto = new UserDTO(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmailVerified(),
                user.getCreatedAt(),
                user.getLastLoginAt()
        );

        if (user.getPreferences() != null) {
            UserPreferences prefs = user.getPreferences();
            UserDTO.UserPreferencesDTO prefsDTO = new UserDTO.UserPreferencesDTO(
                    prefs.getCurrency(),
                    prefs.getDateFormat(),
                    prefs.getDefaultCategory(),
                    prefs.getEnableNotifications(),
                    prefs.getTheme()
            );
            dto.setPreferences(prefsDTO);
        }

        return dto;
    }
}