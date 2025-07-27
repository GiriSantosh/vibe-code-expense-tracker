package com.expensetracker.service;

import com.expensetracker.exception.InvalidInputException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
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

    public Page<Expense> getAllExpenses(Pageable pageable) {
        return expenseRepository.findAll(pageable);
    }

    public Expense getExpenseById(Long id) {
        return expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id " + id));
    }

    public Expense createExpense(Expense expense) {
        return expenseRepository.save(expense);
    }

    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found with id " + id);
        }
        expenseRepository.deleteById(id);
    }

    public Page<Expense> getExpensesByCategory(ExpenseCategory category, Pageable pageable) {
        if (category == null) {
            throw new InvalidInputException("Category cannot be null");
        }
        return expenseRepository.findByCategory(category, pageable);
    }

    public Page<Expense> getExpensesByDateRange(LocalDate startDate, LocalDate endDate, Pageable pageable) {
        if (startDate == null || endDate == null) {
            throw new InvalidInputException("Start date and end date cannot be null");
        }
        if (startDate.isAfter(endDate)) {
            throw new InvalidInputException("Start date cannot be after end date");
        }
        return expenseRepository.findByDateBetween(startDate, endDate, pageable);
    }

    public List<Map<String, Object>> getMonthlySummary(LocalDate startDate, LocalDate endDate) {
        if (startDate == null || endDate == null) {
            throw new InvalidInputException("Start date and end date cannot be null");
        }
        if (startDate.isAfter(endDate)) {
            throw new InvalidInputException("Start date cannot be after end date");
        }
        return expenseRepository.getMonthlySummary(startDate, endDate);
    }

    public List<Map<String, Object>> getCategorySummary() {
        List<Object[]> rawSummary = expenseRepository.getCategorySummary();
        return rawSummary.stream().map(row -> {
            Map<String, Object> summaryMap = new HashMap<>();
            summaryMap.put("category", ((ExpenseCategory) row[0]).name());
            summaryMap.put("total", row[1]);
            return summaryMap;
        }).collect(java.util.stream.Collectors.toList());
    }
}
