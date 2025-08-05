package com.expensetracker.service;

import com.expensetracker.exception.InvalidInputException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.model.User;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private UserService userService;

    public Page<Expense> getAllExpenses(Authentication authentication, Pageable pageable) {
        User currentUser = getCurrentUser(authentication);
        return expenseRepository.findByUser(currentUser, pageable);
    }

    public Expense getExpenseById(Authentication authentication, Long id) {
        User currentUser = getCurrentUser(authentication);
        return expenseRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id " + id));
    }

    public Expense createExpense(Authentication authentication, Expense expense) {
        User currentUser = getCurrentUser(authentication);
        expense.setUser(currentUser);
        return expenseRepository.save(expense);
    }

    public void deleteExpense(Authentication authentication, Long id) {
        User currentUser = getCurrentUser(authentication);
        Expense expense = expenseRepository.findByIdAndUser(id, currentUser)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id " + id));
        expenseRepository.delete(expense);
    }

    public Page<Expense> getExpensesByCategory(Authentication authentication, ExpenseCategory category, Pageable pageable) {
        if (category == null) {
            throw new InvalidInputException("Category cannot be null");
        }
        User currentUser = getCurrentUser(authentication);
        return expenseRepository.findByUserAndCategory(currentUser, category, pageable);
    }

    public Page<Expense> getExpensesByDateRange(Authentication authentication, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        if (startDate == null || endDate == null) {
            throw new InvalidInputException("Start date and end date cannot be null");
        }
        if (startDate.isAfter(endDate)) {
            throw new InvalidInputException("Start date cannot be after end date");
        }
        User currentUser = getCurrentUser(authentication);
        return expenseRepository.findByUserAndDateBetween(currentUser, startDate, endDate, pageable);
    }

    public List<Map<String, Object>> getMonthlySummary(Authentication authentication, LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new InvalidInputException("Start date and end date cannot be null");
        }
        if (startDate.isAfter(endDate)) {
            throw new InvalidInputException("Start date cannot be after end date");
        }
        User currentUser = getCurrentUser(authentication);
        return expenseRepository.getMonthlySummaryByUser(currentUser, startDate, endDate);
    }

    public List<Map<String, Object>> getCategorySummary(Authentication authentication) {
        User currentUser = getCurrentUser(authentication);
        List<Object[]> rawSummary = expenseRepository.getCategorySummaryByUser(currentUser);
        return rawSummary.stream().map(row -> {
            Map<String, Object> summaryMap = new HashMap<>();
            summaryMap.put("category", ((ExpenseCategory) row[0]).name());
            summaryMap.put("total", row[1]);
            return summaryMap;
        }).collect(java.util.stream.Collectors.toList());
    }

    private User getCurrentUser(Authentication authentication) {
        String username = extractUsername(authentication);
        User user = userService.findByUsername(username);
        if (user == null) {
            throw new RuntimeException("User not found");
        }
        return user;
    }

    private String extractUsername(Authentication authentication) {
        if (authentication.getPrincipal() instanceof OAuth2User oauth2User) {
            return oauth2User.getAttribute("preferred_username");
        }
        return authentication.getName();
    }
}
