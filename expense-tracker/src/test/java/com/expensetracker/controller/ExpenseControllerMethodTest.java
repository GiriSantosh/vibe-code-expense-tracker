package com.expensetracker.controller;

import com.expensetracker.web.controller.*;

import com.expensetracker.web.exception.InvalidInputException;
import com.expensetracker.web.exception.ResourceNotFoundException;
import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.backend.service.ExpenseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.test.context.ActiveProfiles;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@ActiveProfiles("test")
class ExpenseControllerMethodTest {

    @Mock
    private ExpenseService expenseService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private ExpenseController expenseController;

    private Expense testExpense;
    private Page<Expense> testPage;

    @BeforeEach
    void setUp() {
        testExpense = new Expense();
        testExpense.setId(1L);
        testExpense.setAmount(new BigDecimal("25.50"));
        testExpense.setCategory(ExpenseCategory.FOOD);
        testExpense.setDescription("Test expense");
        testExpense.setDate(LocalDate.now());

        testPage = new PageImpl<>(List.of(testExpense));
    }

    @Test
    @DisplayName("Should get all expenses without filters")
    void shouldGetAllExpensesWithoutFilters() {
        // Given
        Pageable pageable = mock(Pageable.class);
        when(expenseService.getAllExpenses(authentication, pageable)).thenReturn(testPage);

        // When
        Page<Expense> result = expenseController.getAllExpenses(null, null, null, pageable, authentication);

        // Then
        assertEquals(testPage, result);
        verify(expenseService, times(1)).getAllExpenses(authentication, pageable);
    }

    @Test
    @DisplayName("Should get expenses by category when category filter provided")
    void shouldGetExpensesByCategoryWhenCategoryFilterProvided() {
        // Given
        ExpenseCategory category = ExpenseCategory.FOOD;
        Pageable pageable = mock(Pageable.class);
        when(expenseService.getExpensesByCategory(authentication, category, pageable)).thenReturn(testPage);

        // When
        Page<Expense> result = expenseController.getAllExpenses(category, null, null, pageable, authentication);

        // Then
        assertEquals(testPage, result);
        verify(expenseService, times(1)).getExpensesByCategory(authentication, category, pageable);
        verify(expenseService, never()).getAllExpenses(any(), any());
    }

    @Test
    @DisplayName("Should get expenses by date range when date filters provided")
    void shouldGetExpensesByDateRangeWhenDateFiltersProvided() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Pageable pageable = mock(Pageable.class);
        when(expenseService.getExpensesByDateRange(authentication, startDate, endDate, pageable)).thenReturn(testPage);

        // When
        Page<Expense> result = expenseController.getAllExpenses(null, startDate, endDate, pageable, authentication);

        // Then
        assertEquals(testPage, result);
        verify(expenseService, times(1)).getExpensesByDateRange(authentication, startDate, endDate, pageable);
        verify(expenseService, never()).getAllExpenses(any(), any());
    }

    @Test
    @DisplayName("Should prioritize category filter over date range")
    void shouldPrioritizeCategoryFilterOverDateRange() {
        // Given
        ExpenseCategory category = ExpenseCategory.FOOD;
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        Pageable pageable = mock(Pageable.class);
        when(expenseService.getExpensesByCategory(authentication, category, pageable)).thenReturn(testPage);

        // When
        Page<Expense> result = expenseController.getAllExpenses(category, startDate, endDate, pageable, authentication);

        // Then
        assertEquals(testPage, result);
        verify(expenseService, times(1)).getExpensesByCategory(authentication, category, pageable);
        verify(expenseService, never()).getExpensesByDateRange(any(), any(), any(), any());
    }

    @Test
    @DisplayName("Should get expense by id successfully")
    void shouldGetExpenseByIdSuccessfully() {
        // Given
        Long expenseId = 1L;
        when(expenseService.getExpenseById(authentication, expenseId)).thenReturn(testExpense);

        // When
        ResponseEntity<Expense> response = expenseController.getExpenseById(expenseId, authentication);

        // Then
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(testExpense, response.getBody());
        verify(expenseService, times(1)).getExpenseById(authentication, expenseId);
    }

    @Test
    @DisplayName("Should handle expense not found exception")
    void shouldHandleExpenseNotFoundException() {
        // Given
        Long expenseId = 999L;
        when(expenseService.getExpenseById(authentication, expenseId))
            .thenThrow(new ResourceNotFoundException("Expense not found"));

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> 
            expenseController.getExpenseById(expenseId, authentication));
        
        verify(expenseService, times(1)).getExpenseById(authentication, expenseId);
    }

    @Test
    @DisplayName("Should create expense successfully")
    void shouldCreateExpenseSuccessfully() {
        // Given
        when(expenseService.createExpense(authentication, testExpense)).thenReturn(testExpense);

        // When
        ResponseEntity<Expense> response = expenseController.createExpense(testExpense, authentication);

        // Then
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(testExpense, response.getBody());
        verify(expenseService, times(1)).createExpense(authentication, testExpense);
    }

    @Test
    @DisplayName("Should handle invalid input exception when creating expense")
    void shouldHandleInvalidInputExceptionWhenCreatingExpense() {
        // Given
        when(expenseService.createExpense(authentication, testExpense))
            .thenThrow(new InvalidInputException("Invalid expense data"));

        // When & Then
        assertThrows(InvalidInputException.class, () -> 
            expenseController.createExpense(testExpense, authentication));
        
        verify(expenseService, times(1)).createExpense(authentication, testExpense);
    }

    @Test
    @DisplayName("Should delete expense successfully")
    void shouldDeleteExpenseSuccessfully() {
        // Given
        Long expenseId = 1L;
        doNothing().when(expenseService).deleteExpense(authentication, expenseId);

        // When
        ResponseEntity<Void> response = expenseController.deleteExpense(expenseId, authentication);

        // Then
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        verify(expenseService, times(1)).deleteExpense(authentication, expenseId);
    }

    @Test
    @DisplayName("Should handle resource not found when deleting expense")
    void shouldHandleResourceNotFoundWhenDeletingExpense() {
        // Given
        Long expenseId = 999L;
        doThrow(new ResourceNotFoundException("Expense not found"))
            .when(expenseService).deleteExpense(authentication, expenseId);

        // When & Then
        assertThrows(ResourceNotFoundException.class, () -> 
            expenseController.deleteExpense(expenseId, authentication));
        
        verify(expenseService, times(1)).deleteExpense(authentication, expenseId);
    }

    @Test
    @DisplayName("Should get monthly summary successfully")
    void shouldGetMonthlySummarySuccessfully() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        List<Map<String, Object>> summary = List.of(
            Map.of("month", "2024-01", "total", new BigDecimal("150.00"))
        );
        when(expenseService.getMonthlySummary(authentication, startDate, endDate)).thenReturn(summary);

        // When
        List<Map<String, Object>> result = expenseController.getMonthlySummary(startDate, endDate, authentication);

        // Then
        assertEquals(summary, result);
        verify(expenseService, times(1)).getMonthlySummary(authentication, startDate, endDate);
    }

    @Test
    @DisplayName("Should get category summary successfully")
    void shouldGetCategorySummarySuccessfully() {
        // Given
        List<Map<String, Object>> summary = List.of(
            Map.of("category", "FOOD", "total", new BigDecimal("200.00"))
        );
        when(expenseService.getCategorySummary(authentication)).thenReturn(summary);

        // When
        List<Map<String, Object>> result = expenseController.getCategorySummary(authentication);

        // Then
        assertEquals(summary, result);
        verify(expenseService, times(1)).getCategorySummary(authentication);
    }

    @Test
    @DisplayName("Should handle service exceptions in monthly summary")
    void shouldHandleServiceExceptionsInMonthlySummary() {
        // Given
        LocalDate startDate = LocalDate.of(2024, 1, 1);
        LocalDate endDate = LocalDate.of(2024, 12, 31);
        when(expenseService.getMonthlySummary(authentication, startDate, endDate))
            .thenThrow(new InvalidInputException("Invalid date range"));

        // When & Then
        assertThrows(InvalidInputException.class, () -> 
            expenseController.getMonthlySummary(startDate, endDate, authentication));
        
        verify(expenseService, times(1)).getMonthlySummary(authentication, startDate, endDate);
    }

    @Test
    @DisplayName("Should handle service exceptions in category summary")
    void shouldHandleServiceExceptionsInCategorySummary() {
        // Given
        when(expenseService.getCategorySummary(authentication))
            .thenThrow(new RuntimeException("Database error"));

        // When & Then
        assertThrows(RuntimeException.class, () -> 
            expenseController.getCategorySummary(authentication));
        
        verify(expenseService, times(1)).getCategorySummary(authentication);
    }

    @Test
    @DisplayName("Should handle ResourceNotFoundException with proper response")
    void shouldHandleResourceNotFoundExceptionWithProperResponse() {
        // Given
        ResourceNotFoundException exception = new ResourceNotFoundException("Expense not found");

        // When
        String result = expenseController.handleResourceNotFoundException(exception);

        // Then
        assertEquals("Expense not found", result);
    }

    @Test
    @DisplayName("Should handle InvalidInputException with proper response")
    void shouldHandleInvalidInputExceptionWithProperResponse() {
        // Given
        InvalidInputException exception = new InvalidInputException("Invalid input data");

        // When
        String result = expenseController.handleInvalidInputException(exception);

        // Then
        assertEquals("Invalid input data", result);
    }

    @Test
    @DisplayName("Should verify controller has correct annotations")
    void shouldVerifyControllerHasCorrectAnnotations() {
        // Then
        assertTrue(expenseController.getClass().isAnnotationPresent(org.springframework.web.bind.annotation.RestController.class));
        assertTrue(expenseController.getClass().isAnnotationPresent(org.springframework.web.bind.annotation.RequestMapping.class));
        assertTrue(expenseController.getClass().isAnnotationPresent(org.springframework.security.access.prepost.PreAuthorize.class));
        
        var requestMapping = expenseController.getClass().getAnnotation(org.springframework.web.bind.annotation.RequestMapping.class);
        assertArrayEquals(new String[]{"/api/expenses"}, requestMapping.value());
        
        var preAuthorize = expenseController.getClass().getAnnotation(org.springframework.security.access.prepost.PreAuthorize.class);
        assertEquals("hasRole('USER')", preAuthorize.value());
    }
}