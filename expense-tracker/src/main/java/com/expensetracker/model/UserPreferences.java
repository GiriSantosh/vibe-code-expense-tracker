package com.expensetracker.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @OneToOne
    @JoinColumn(name = "user_id", referencedColumnName = "id")
    @JsonIgnore
    private User user;

    @Column(name = "currency", length = 3)
    private String currency = "USD";

    @Column(name = "date_format", length = 20)
    private String dateFormat = "MM/dd/yyyy";

    @Enumerated(EnumType.STRING)
    @Column(name = "default_category")
    private ExpenseCategory defaultCategory = ExpenseCategory.OTHER;

    @Column(name = "enable_notifications")
    private Boolean enableNotifications = true;

    @Column(name = "theme")
    private String theme = "light";

    public UserPreferences() {}

    public UserPreferences(User user) {
        this.user = user;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

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