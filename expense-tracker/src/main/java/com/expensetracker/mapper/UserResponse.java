package com.expensetracker.mapper;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UserResponse {
    private boolean success;
    private String message;
    private String id;
    private String email;
    private String firstName;
    private String lastName;
    private String displayName;
    private boolean emailVerified;
}