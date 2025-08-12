package com.expensetracker.service;

import com.expensetracker.backend.service.*;

import com.expensetracker.mapper.UserDTO;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.model.User;
import com.expensetracker.model.UserPreferences;
import com.expensetracker.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("UserService Tests")
public class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private Authentication authentication;

    @Mock
    private OAuth2User oauth2User;

    @InjectMocks
    private UserService userService;

    private User testUser;
    private UserPreferences testPreferences;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser@example.com", "test@example.com", "Test", "User");
        testUser.setId("user-123");
        testUser.setEmailVerified(true);
        testUser.setCreatedAt(LocalDateTime.now().minusDays(30));
        testUser.setLastLoginAt(LocalDateTime.now());

        testPreferences = new UserPreferences(testUser);
        testPreferences.setCurrency("USD");
        testPreferences.setDateFormat("MM/dd/yyyy");
        testPreferences.setDefaultCategory(ExpenseCategory.FOOD);
        testUser.setPreferences(testPreferences);
    }

    @Test
    @DisplayName("Should get current user successfully")
    void whenGetCurrentUser_thenReturnUserDTO() {
        // Given
        when(authentication.getPrincipal()).thenReturn(oauth2User);
        when(oauth2User.getAttribute("preferred_username")).thenReturn("testuser@example.com");
        when(userRepository.findByUsername("testuser@example.com")).thenReturn(Optional.of(testUser));

        // When
        UserDTO result = userService.getCurrentUser(authentication);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo("user-123");
        assertThat(result.getUsername()).isEqualTo("testuser@example.com");
        assertThat(result.getEmail()).isEqualTo("test@example.com");
        assertThat(result.getFirstName()).isEqualTo("Test");
        assertThat(result.getLastName()).isEqualTo("User");
        assertThat(result.getEmailVerified()).isTrue();
        assertThat(result.getPreferences()).isNotNull();
        assertThat(result.getPreferences().getCurrency()).isEqualTo("USD");
    }

    @Test
    @DisplayName("Should throw exception when user not found")
    void whenGetCurrentUserNotFound_thenThrowException() {
        // Given
        when(authentication.getPrincipal()).thenReturn(oauth2User);
        when(oauth2User.getAttribute("preferred_username")).thenReturn("nonexistent@example.com");
        when(userRepository.findByUsername("nonexistent@example.com")).thenReturn(Optional.empty());

        // When & Then
        assertThrows(RuntimeException.class, () -> userService.getCurrentUser(authentication));
    }

    @Test
    @DisplayName("Should create new user from OAuth2 data")
    void whenCreateOrUpdateUserNewUser_thenCreateUser() {
        // Given
        Map<String, Object> attributes = new HashMap<>();
        attributes.put("preferred_username", "newuser@example.com");
        attributes.put("email", "newuser@example.com");
        attributes.put("given_name", "New");
        attributes.put("family_name", "User");
        attributes.put("email_verified", true);

        when(oauth2User.getAttribute("preferred_username")).thenReturn("newuser@example.com");
        when(oauth2User.getAttribute("email")).thenReturn("newuser@example.com");
        when(oauth2User.getAttribute("given_name")).thenReturn("New");
        when(oauth2User.getAttribute("family_name")).thenReturn("User");
        when(oauth2User.getAttribute("email_verified")).thenReturn(true);

        when(userRepository.findByUsername("newuser@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        User result = userService.createOrUpdateUser(oauth2User);

        // Then
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getUsername()).isEqualTo("newuser@example.com");
        assertThat(savedUser.getEmail()).isEqualTo("newuser@example.com");
        assertThat(savedUser.getFirstName()).isEqualTo("New");
        assertThat(savedUser.getLastName()).isEqualTo("User");
        assertThat(savedUser.getEmailVerified()).isTrue();
        assertThat(savedUser.getPreferences()).isNotNull();
        assertThat(savedUser.getLastLoginAt()).isNotNull();
    }

    @Test
    @DisplayName("Should update existing user from OAuth2 data")
    void whenCreateOrUpdateUserExistingUser_thenUpdateUser() {
        // Given
        when(oauth2User.getAttribute("preferred_username")).thenReturn("testuser@example.com");
        when(oauth2User.getAttribute("email")).thenReturn("updated@example.com");
        when(oauth2User.getAttribute("given_name")).thenReturn("Test");
        when(oauth2User.getAttribute("family_name")).thenReturn("User");
        when(oauth2User.getAttribute("email_verified")).thenReturn(true);

        when(userRepository.findByUsername("testuser@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        LocalDateTime oldLastLogin = testUser.getLastLoginAt();

        // When
        User result = userService.createOrUpdateUser(oauth2User);

        // Then
        verify(userRepository).save(testUser);
        assertThat(testUser.getEmail()).isEqualTo("updated@example.com");
        assertThat(testUser.getLastLoginAt()).isAfter(oldLastLogin);
        assertThat(testUser.getEmailVerified()).isTrue();
    }

    @Test
    @DisplayName("Should update user profile successfully")
    void whenUpdateUserProfile_thenUpdateFields() {
        // Given
        when(authentication.getPrincipal()).thenReturn(oauth2User);
        when(oauth2User.getAttribute("preferred_username")).thenReturn("testuser@example.com");
        when(userRepository.findByUsername("testuser@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserDTO updateData = new UserDTO();
        updateData.setFirstName("Updated");
        updateData.setLastName("Name");
        
        UserDTO.UserPreferencesDTO prefsUpdate = new UserDTO.UserPreferencesDTO();
        prefsUpdate.setCurrency("EUR");
        prefsUpdate.setDefaultCategory(ExpenseCategory.TRANSPORTATION);
        updateData.setPreferences(prefsUpdate);

        // When
        UserDTO result = userService.updateUserProfile(authentication, updateData);

        // Then
        verify(userRepository).save(testUser);
        assertThat(testUser.getFirstName()).isEqualTo("Updated");
        assertThat(testUser.getLastName()).isEqualTo("Name");
        assertThat(testUser.getPreferences().getCurrency()).isEqualTo("EUR");
        assertThat(testUser.getPreferences().getDefaultCategory()).isEqualTo(ExpenseCategory.TRANSPORTATION);
        
        assertThat(result.getFirstName()).isEqualTo("Updated");
        assertThat(result.getLastName()).isEqualTo("Name");
    }

    @Test
    @DisplayName("Should handle partial user profile updates")
    void whenUpdateUserProfilePartial_thenUpdateOnlyProvidedFields() {
        // Given
        when(authentication.getPrincipal()).thenReturn(oauth2User);
        when(oauth2User.getAttribute("preferred_username")).thenReturn("testuser@example.com");
        when(userRepository.findByUsername("testuser@example.com")).thenReturn(Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        String originalLastName = testUser.getLastName();
        String originalCurrency = testUser.getPreferences().getCurrency();

        UserDTO updateData = new UserDTO();
        updateData.setFirstName("PartialUpdate");
        // LastName is not set, should remain unchanged

        UserDTO.UserPreferencesDTO prefsUpdate = new UserDTO.UserPreferencesDTO();
        prefsUpdate.setTheme("dark");
        // Currency is not set, should remain unchanged
        updateData.setPreferences(prefsUpdate);

        // When
        UserDTO result = userService.updateUserProfile(authentication, updateData);

        // Then
        assertThat(testUser.getFirstName()).isEqualTo("PartialUpdate");
        assertThat(testUser.getLastName()).isEqualTo(originalLastName); // Unchanged
        assertThat(testUser.getPreferences().getCurrency()).isEqualTo(originalCurrency); // Unchanged
        assertThat(testUser.getPreferences().getTheme()).isEqualTo("dark"); // Updated
    }

    @Test
    @DisplayName("Should find user by username")
    void whenFindByUsername_thenReturnUser() {
        // Given
        when(userRepository.findByUsername("testuser@example.com")).thenReturn(Optional.of(testUser));

        // When
        User result = userService.findByUsername("testuser@example.com");

        // Then
        assertThat(result).isEqualTo(testUser);
    }

    @Test
    @DisplayName("Should return null when user not found by username")
    void whenFindByUsernameNotFound_thenReturnNull() {
        // Given
        when(userRepository.findByUsername("nonexistent@example.com")).thenReturn(Optional.empty());

        // When
        User result = userService.findByUsername("nonexistent@example.com");

        // Then
        assertThat(result).isNull();
    }

    @Test
    @DisplayName("Should handle non-OAuth2 authentication")
    void whenNonOAuth2Authentication_thenUseAuthName() {
        // Given
        when(authentication.getPrincipal()).thenReturn("testuser@example.com");
        when(authentication.getName()).thenReturn("testuser@example.com");
        when(userRepository.findByUsername("testuser@example.com")).thenReturn(Optional.of(testUser));

        // When
        UserDTO result = userService.getCurrentUser(authentication);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getUsername()).isEqualTo("testuser@example.com");
    }

    @Test
    @DisplayName("Should handle missing OAuth2 attributes gracefully")
    void whenMissingOAuth2Attributes_thenHandleGracefully() {
        // Given
        when(oauth2User.getAttribute("preferred_username")).thenReturn("testuser@example.com");
        when(oauth2User.getAttribute("email")).thenReturn(null);
        when(oauth2User.getAttribute("given_name")).thenReturn(null);
        when(oauth2User.getAttribute("family_name")).thenReturn(null);
        when(oauth2User.getAttribute("email_verified")).thenReturn(null);

        when(userRepository.findByUsername("testuser@example.com")).thenReturn(Optional.empty());
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // When
        User result = userService.createOrUpdateUser(oauth2User);

        // Then
        ArgumentCaptor<User> userCaptor = ArgumentCaptor.forClass(User.class);
        verify(userRepository).save(userCaptor.capture());
        
        User savedUser = userCaptor.getValue();
        assertThat(savedUser.getUsername()).isEqualTo("testuser@example.com");
        assertThat(savedUser.getEmail()).isNull();
        assertThat(savedUser.getFirstName()).isNull();
        assertThat(savedUser.getLastName()).isNull();
        assertThat(savedUser.getEmailVerified()).isFalse(); // Default value
    }

    @Test
    @DisplayName("Should convert user to DTO correctly")
    void whenConvertToDTO_thenMapAllFields() {
        // Given
        when(authentication.getPrincipal()).thenReturn(oauth2User);
        when(oauth2User.getAttribute("preferred_username")).thenReturn("testuser@example.com");
        when(userRepository.findByUsername("testuser@example.com")).thenReturn(Optional.of(testUser));

        // When
        UserDTO result = userService.getCurrentUser(authentication);

        // Then
        assertThat(result.getId()).isEqualTo(testUser.getId());
        assertThat(result.getUsername()).isEqualTo(testUser.getUsername());
        assertThat(result.getEmail()).isEqualTo(testUser.getEmail());
        assertThat(result.getFirstName()).isEqualTo(testUser.getFirstName());
        assertThat(result.getLastName()).isEqualTo(testUser.getLastName());
        assertThat(result.getEmailVerified()).isEqualTo(testUser.getEmailVerified());
        assertThat(result.getCreatedAt()).isEqualTo(testUser.getCreatedAt().toString());
        assertThat(result.getLastLoginAt()).isEqualTo(testUser.getLastLoginAt().toString());
        
        // Verify preferences mapping
        assertThat(result.getPreferences()).isNotNull();
        assertThat(result.getPreferences().getCurrency()).isEqualTo(testPreferences.getCurrency());
        assertThat(result.getPreferences().getDateFormat()).isEqualTo(testPreferences.getDateFormat());
        assertThat(result.getPreferences().getDefaultCategory()).isEqualTo(testPreferences.getDefaultCategory());
    }

    @Test
    @DisplayName("Should handle user without preferences")
    void whenUserWithoutPreferences_thenHandleGracefully() {
        // Given
        testUser.setPreferences(null);
        when(authentication.getPrincipal()).thenReturn(oauth2User);
        when(oauth2User.getAttribute("preferred_username")).thenReturn("testuser@example.com");
        when(userRepository.findByUsername("testuser@example.com")).thenReturn(Optional.of(testUser));

        // When
        UserDTO result = userService.getCurrentUser(authentication);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getPreferences()).isNull();
    }
}