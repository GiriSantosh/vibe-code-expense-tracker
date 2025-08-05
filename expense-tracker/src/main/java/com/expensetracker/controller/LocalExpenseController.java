package com.expensetracker.controller;

import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/local")
@CrossOrigin(origins = "*")
@Profile("local")
public class LocalExpenseController {

    @Autowired
    private ExpenseRepository expenseRepository;

    @GetMapping("/expenses")
    public ResponseEntity<Page<Expense>> getAllExpenses(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? 
            Sort.Direction.DESC : Sort.Direction.ASC;
        
        String sortField = sortBy != null ? sortBy : "date";
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortField));

        Page<Expense> expenses;
        if (category != null && !category.isEmpty()) {
            ExpenseCategory expenseCategory = ExpenseCategory.valueOf(category.toUpperCase());
            expenses = expenseRepository.findByCategory(expenseCategory, pageable);
        } else {
            expenses = expenseRepository.findAll(pageable);
        }

        return ResponseEntity.ok(expenses);
    }

    @PostMapping("/expenses")
    public ResponseEntity<Expense> createExpense(@RequestBody Expense expense) {
        Expense savedExpense = expenseRepository.save(expense);
        return ResponseEntity.ok(savedExpense);
    }

    @GetMapping("/expenses/{id}")
    public ResponseEntity<Expense> getExpense(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .map(expense -> ResponseEntity.ok().body(expense))
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/expenses/{id}")
    public ResponseEntity<Expense> updateExpense(@PathVariable Long id, @RequestBody Expense expenseDetails) {
        return expenseRepository.findById(id)
                .map(expense -> {
                    expense.setAmount(expenseDetails.getAmount());
                    expense.setCategory(expenseDetails.getCategory());
                    expense.setDescription(expenseDetails.getDescription());
                    expense.setDate(expenseDetails.getDate());
                    return ResponseEntity.ok(expenseRepository.save(expense));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/expenses/{id}")
    public ResponseEntity<?> deleteExpense(@PathVariable Long id) {
        return expenseRepository.findById(id)
                .map(expense -> {
                    expenseRepository.delete(expense);
                    return ResponseEntity.ok().build();
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/expenses/summary")
    public ResponseEntity<Map<String, Object>> getExpenseSummary() {
        List<Expense> expenses = expenseRepository.findAll();
        
        double totalAmount = expenses.stream()
                .mapToDouble(expense -> expense.getAmount().doubleValue())
                .sum();
        
        Map<ExpenseCategory, Double> categoryTotals = expenses.stream()
                .collect(Collectors.groupingBy(
                    Expense::getCategory,
                    Collectors.summingDouble(expense -> expense.getAmount().doubleValue())
                ));

        Map<String, Object> summary = Map.of(
            "totalAmount", totalAmount,
            "totalCount", expenses.size(),
            "categoryBreakdown", categoryTotals
        );

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "mode", "local-development",
            "database", "H2-memory"
        ));
    }
}