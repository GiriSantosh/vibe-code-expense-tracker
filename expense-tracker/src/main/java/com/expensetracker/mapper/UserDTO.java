package com.expensetracker.mapper;

import com.expensetracker.model.ExpenseCategory;
import java.time.LocalDateTime;

public class UserDTO {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private Boolean emailVerified;
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private UserPreferencesDTO preferences;

    public UserDTO() {}

    public UserDTO(String id, String username, String email, String firstName, String lastName, 
                   Boolean emailVerified, LocalDateTime createdAt, LocalDateTime lastLoginAt) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.emailVerified = emailVerified;
        this.createdAt = createdAt;
        this.lastLoginAt = lastLoginAt;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public Boolean getEmailVerified() {
        return emailVerified;
    }

    public void setEmailVerified(Boolean emailVerified) {
        this.emailVerified = emailVerified;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getLastLoginAt() {
        return lastLoginAt;
    }

    public void setLastLoginAt(LocalDateTime lastLoginAt) {
        this.lastLoginAt = lastLoginAt;
    }

    public UserPreferencesDTO getPreferences() {
        return preferences;
    }

    public void setPreferences(UserPreferencesDTO preferences) {
        this.preferences = preferences;
    }

    public static class UserPreferencesDTO {
        private String currency;
        private String dateFormat;
        private ExpenseCategory defaultCategory;
        private Boolean enableNotifications;
        private String theme;

        public UserPreferencesDTO() {}

        public UserPreferencesDTO(String currency, String dateFormat, ExpenseCategory defaultCategory, 
                                Boolean enableNotifications, String theme) {
            this.currency = currency;
            this.dateFormat = dateFormat;
            this.defaultCategory = defaultCategory;
            this.enableNotifications = enableNotifications;
            this.theme = theme;
        }

        // Getters and Setters
        public String getCurrency() {
            return currency;
        }

        public void setCurrency(String currency) {
            this.currency = currency;
        }

        public String getDateFormat() {
            return dateFormat;
        }

        public void setDateFormat(String dateFormat) {
            this.dateFormat = dateFormat;
        }

        public ExpenseCategory getDefaultCategory() {
            return defaultCategory;
        }

        public void setDefaultCategory(ExpenseCategory defaultCategory) {
            this.defaultCategory = defaultCategory;
        }

        public Boolean getEnableNotifications() {
            return enableNotifications;
        }

        public void setEnableNotifications(Boolean enableNotifications) {
            this.enableNotifications = enableNotifications;
        }

        public String getTheme() {
            return theme;
        }

        public void setTheme(String theme) {
            this.theme = theme;
        }
    }
}