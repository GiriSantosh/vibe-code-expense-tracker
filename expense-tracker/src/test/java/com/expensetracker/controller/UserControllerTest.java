package com.expensetracker.controller;

import com.expensetracker.dto.UserDTO;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import org.springframework.test.context.ActiveProfiles;

@WebMvcTest(UserController.class)
@Import({TestSecurityConfig.class})
@ActiveProfiles("test")
@DisplayName("UserController Tests")
public class UserControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UserService userService;

    @Autowired
    private ObjectMapper objectMapper;

    private UserDTO testUserDTO;
    private UserDTO.UserPreferencesDTO testPreferencesDTO;

    @BeforeEach
    void setUp() {
        testPreferencesDTO = new UserDTO.UserPreferencesDTO();
        testPreferencesDTO.setCurrency("USD");
        testPreferencesDTO.setDateFormat("MM/dd/yyyy");
        testPreferencesDTO.setDefaultCategory(ExpenseCategory.FOOD);
        testPreferencesDTO.setEnableNotifications(true);
        testPreferencesDTO.setTheme("light");

        testUserDTO = new UserDTO();
        testUserDTO.setId("user-123");
        testUserDTO.setUsername("testuser@example.com");
        testUserDTO.setEmail("test@example.com");
        testUserDTO.setFirstName("Test");
        testUserDTO.setLastName("User");
        testUserDTO.setEmailVerified(true);
        testUserDTO.setCreatedAt(LocalDateTime.now().minusDays(30));
        testUserDTO.setLastLoginAt(LocalDateTime.now());
        testUserDTO.setPreferences(testPreferencesDTO);
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"USER"})
    @DisplayName("Should get current user successfully")
    void whenGetCurrentUser_thenReturnUserDTO() throws Exception {
        // Given
        when(userService.getCurrentUser(any())).thenReturn(testUserDTO);

        // When & Then
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("user-123"))
                .andExpect(jsonPath("$.username").value("testuser@example.com"))
                .andExpect(jsonPath("$.email").value("test@example.com"))
                .andExpect(jsonPath("$.firstName").value("Test"))
                .andExpect(jsonPath("$.lastName").value("User"))
                .andExpect(jsonPath("$.emailVerified").value(true))
                .andExpect(jsonPath("$.preferences.currency").value("USD"))
                .andExpect(jsonPath("$.preferences.defaultCategory").value("FOOD"));
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"USER"})
    @DisplayName("Should return 404 when user not found")
    void whenGetCurrentUserNotFound_thenReturn404() throws Exception {
        // Given
        when(userService.getCurrentUser(any())).thenThrow(new RuntimeException("User not found"));

        // When & Then
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"USER"})
    @DisplayName("Should update user profile successfully")
    void whenUpdateCurrentUser_thenReturnUpdatedUser() throws Exception {
        // Given
        UserDTO updateDTO = new UserDTO();
        updateDTO.setFirstName("Updated");
        updateDTO.setLastName("Name");

        UserDTO updatedUserDTO = new UserDTO();
        updatedUserDTO.setId("user-123");
        updatedUserDTO.setUsername("testuser@example.com");
        updatedUserDTO.setEmail("test@example.com");
        updatedUserDTO.setFirstName("Updated");
        updatedUserDTO.setLastName("Name");
        updatedUserDTO.setEmailVerified(true);
        updatedUserDTO.setPreferences(testPreferencesDTO);

        when(userService.updateUserProfile(any(), any(UserDTO.class))).thenReturn(updatedUserDTO);

        // When & Then
        mockMvc.perform(put("/api/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Updated"))
                .andExpect(jsonPath("$.lastName").value("Name"))
                .andExpect(jsonPath("$.username").value("testuser@example.com"));
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"USER"})
    @DisplayName("Should return 400 when update fails")
    void whenUpdateCurrentUserFails_thenReturn400() throws Exception {
        // Given
        UserDTO updateDTO = new UserDTO();
        updateDTO.setFirstName("Updated");

        when(userService.updateUserProfile(any(), any(UserDTO.class)))
                .thenThrow(new RuntimeException("Update failed"));

        // When & Then
        mockMvc.perform(put("/api/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updateDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"USER"})
    @DisplayName("Should get user preferences successfully")
    void whenGetUserPreferences_thenReturnPreferences() throws Exception {
        // Given
        when(userService.getCurrentUser(any())).thenReturn(testUserDTO);

        // When & Then
        mockMvc.perform(get("/api/me/preferences"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currency").value("USD"))
                .andExpect(jsonPath("$.dateFormat").value("MM/dd/yyyy"))
                .andExpect(jsonPath("$.defaultCategory").value("FOOD"))
                .andExpect(jsonPath("$.enableNotifications").value(true))
                .andExpect(jsonPath("$.theme").value("light"));
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"USER"})
    @DisplayName("Should return 404 when getting preferences for non-existent user")
    void whenGetUserPreferencesNotFound_thenReturn404() throws Exception {
        // Given
        when(userService.getCurrentUser(any())).thenThrow(new RuntimeException("User not found"));

        // When & Then
        mockMvc.perform(get("/api/me/preferences"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"USER"})
    @DisplayName("Should update user preferences successfully")
    void whenUpdateUserPreferences_thenReturnUpdatedPreferences() throws Exception {
        // Given
        UserDTO.UserPreferencesDTO updatePrefs = new UserDTO.UserPreferencesDTO();
        updatePrefs.setCurrency("EUR");
        updatePrefs.setTheme("dark");
        updatePrefs.setDefaultCategory(ExpenseCategory.TRANSPORTATION);

        UserDTO.UserPreferencesDTO updatedPrefs = new UserDTO.UserPreferencesDTO();
        updatedPrefs.setCurrency("EUR");
        updatedPrefs.setDateFormat("MM/dd/yyyy"); // Unchanged
        updatedPrefs.setDefaultCategory(ExpenseCategory.TRANSPORTATION);
        updatedPrefs.setEnableNotifications(true); // Unchanged
        updatedPrefs.setTheme("dark");

        UserDTO updatedUserDTO = new UserDTO();
        updatedUserDTO.setPreferences(updatedPrefs);

        when(userService.updateUserProfile(any(), any(UserDTO.class))).thenReturn(updatedUserDTO);

        // When & Then
        mockMvc.perform(put("/api/me/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatePrefs)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currency").value("EUR"))
                .andExpect(jsonPath("$.theme").value("dark"))
                .andExpect(jsonPath("$.defaultCategory").value("TRANSPORTATION"));
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"USER"})
    @DisplayName("Should return 400 when preferences update fails")
    void whenUpdateUserPreferencesFails_thenReturn400() throws Exception {
        // Given
        UserDTO.UserPreferencesDTO updatePrefs = new UserDTO.UserPreferencesDTO();
        updatePrefs.setCurrency("INVALID");

        when(userService.updateUserProfile(any(), any(UserDTO.class)))
                .thenThrow(new RuntimeException("Invalid currency"));

        // When & Then
        mockMvc.perform(put("/api/me/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(updatePrefs)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"ADMIN"})
    @DisplayName("Should allow admin access to user endpoints")
    void whenAdminAccessUserEndpoints_thenAllow() throws Exception {
        // Given
        when(userService.getCurrentUser(any())).thenReturn(testUserDTO);

        // When & Then
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/me/preferences"))
                .andExpect(status().isOk());
    }

    @Test
    @DisplayName("Should require authentication for user endpoints")
    void whenUnauthenticatedAccess_thenReturn401() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/me/preferences"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(put("/api/me/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"GUEST"})
    @DisplayName("Should deny access for insufficient roles")
    void whenInsufficientRole_thenReturn403() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"USER"})
    @DisplayName("Should handle malformed JSON gracefully")
    void whenMalformedJSON_thenReturn400() throws Exception {
        // When & Then
        mockMvc.perform(put("/api/me")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid json"))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(username = "testuser@example.com", roles = {"USER"})
    @DisplayName("Should handle empty request body for preferences update")
    void whenEmptyPreferencesUpdate_thenReturnOk() throws Exception {
        // Given
        UserDTO.UserPreferencesDTO emptyPrefs = new UserDTO.UserPreferencesDTO();
        UserDTO updatedUserDTO = new UserDTO();
        updatedUserDTO.setPreferences(testPreferencesDTO); // Return unchanged preferences

        when(userService.updateUserProfile(any(), any(UserDTO.class))).thenReturn(updatedUserDTO);

        // When & Then
        mockMvc.perform(put("/api/me/preferences")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(emptyPrefs)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.currency").value("USD")); // Should remain unchanged
    }
}