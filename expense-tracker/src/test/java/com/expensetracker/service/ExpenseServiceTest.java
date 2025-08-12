package com.expensetracker.service;

import com.expensetracker.backend.service.*;

import com.expensetracker.web.exception.InvalidInputException;
import com.expensetracker.web.exception.ResourceNotFoundException;
import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.model.User;
import com.expensetracker.model.UserPreferences;
import com.expensetracker.repository.ExpenseRepository;
import com.expensetracker.backend.service.ExpenseService;
import com.expensetracker.backend.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;
import static org.mockito.Mockito.lenient;

@ExtendWith(MockitoExtension.class)
@DisplayName("ExpenseService Authentication-Aware Tests")
public class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    @Mock
    private OAuth2User oauth2User;

    @InjectMocks
    private ExpenseService expenseService;

    private User testUser;
    private Expense testExpense;
    private Pageable pageable;

    @BeforeEach
    void setUp() {
        testUser = new User("testuser@example.com", "test@example.com", "Test", "User");
        testUser.setId("user-123");
        
        UserPreferences preferences = new UserPreferences(testUser);
        testUser.setPreferences(preferences);

        testExpense = new Expense(new BigDecimal("25.50"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        testExpense.setId(1L);
        testExpense.setUser(testUser);

        pageable = PageRequest.of(0, 10);

        // Default mocking for authentication (lenient for tests that don't use it)
        lenient().when(authentication.getPrincipal()).thenReturn(oauth2User);
        lenient().when(oauth2User.getAttribute("preferred_username")).thenReturn("testuser@example.com");
        lenient().when(userService.findByUsername("testuser@example.com")).thenReturn(testUser);
    }

    @Test
    @DisplayName("Should get all expenses for authenticated user")
    void whenGetAllExpensesWithAuth_thenReturnUserExpenses() {
        // Given
        List<Expense> userExpenses = Arrays.asList(testExpense);
        Page<Expense> expectedPage = new PageImpl<>(userExpenses);
        when(expenseRepository.findByUser(testUser, pageable)).thenReturn(expectedPage);

        // When
        Page<Expense> actualPage = expenseService.getAllExpenses(authentication, pageable);

        // Then
        assertThat(actualPage).isEqualTo(expectedPage);
        assertThat(actualPage.getContent()).hasSize(1);
        assertThat(actualPage.getContent().get(0).getUser()).isEqualTo(testUser);
        verify(expenseRepository).findByUser(testUser, pageable);
    }

    @Test
    @DisplayName("Should get expense by ID for authenticated user")
    void whenGetExpenseByIdWithAuth_thenReturnUserExpense() {
        // Given
        when(expenseRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testExpense));

        // When
        Expense actualExpense = expenseService.getExpenseById(authentication, 1L);

        // Then
        assertThat(actualExpense).isEqualTo(testExpense);
        assertThat(actualExpense.getUser()).isEqualTo(testUser);
        verify(expenseRepository).findByIdAndUser(1L, testUser);
    }

    @Test
    @DisplayName("Should throw exception when expense not found for user")
    void whenGetExpenseByIdNotFound_thenThrowException() {
        // Given
        when(expenseRepository.findByIdAndUser(999L, testUser)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, 
            () -> expenseService.getExpenseById(authentication, 999L));
        verify(expenseRepository).findByIdAndUser(999L, testUser);
    }

    @Test
    @DisplayName("Should create expense for authenticated user")
    void whenCreateExpenseWithAuth_thenSetUserAndSave() {
        // Given
        Expense newExpense = new Expense(new BigDecimal("15.00"), ExpenseCategory.TRANSPORTATION, "Bus fare", LocalDate.now());
        Expense savedExpense = new Expense(new BigDecimal("15.00"), ExpenseCategory.TRANSPORTATION, "Bus fare", LocalDate.now());
        savedExpense.setId(2L);
        savedExpense.setUser(testUser);
        
        when(expenseRepository.save(any(Expense.class))).thenReturn(savedExpense);

        // When
        Expense result = expenseService.createExpense(authentication, newExpense);

        // Then
        assertThat(result.getUser()).isEqualTo(testUser);
        assertThat(result.getId()).isEqualTo(2L);
        verify(expenseRepository).save(newExpense);
        assertThat(newExpense.getUser()).isEqualTo(testUser); // Verify user was set
    }

    @Test
    @DisplayName("Should delete expense for authenticated user")
    void whenDeleteExpenseWithAuth_thenDeleteIfUserOwns() {
        // Given
        when(expenseRepository.findByIdAndUser(1L, testUser)).thenReturn(Optional.of(testExpense));
        doNothing().when(expenseRepository).delete(testExpense);

        // When
        expenseService.deleteExpense(authentication, 1L);

        // Then
        verify(expenseRepository).findByIdAndUser(1L, testUser);
        verify(expenseRepository).delete(testExpense);
    }

    @Test
    @DisplayName("Should throw exception when deleting non-existent expense")
    void whenDeleteNonExistentExpense_thenThrowException() {
        // Given
        when(expenseRepository.findByIdAndUser(999L, testUser)).thenReturn(Optional.empty());

        // When & Then
        assertThrows(ResourceNotFoundException.class, 
            () -> expenseService.deleteExpense(authentication, 999L));
        verify(expenseRepository).findByIdAndUser(999L, testUser);
        verify(expenseRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should get expenses by category for authenticated user")
    void whenGetExpensesByCategoryWithAuth_thenReturnUserExpenses() {
        // Given
        List<Expense> categoryExpenses = Arrays.asList(testExpense);
        Page<Expense> expectedPage = new PageImpl<>(categoryExpenses);
        when(expenseRepository.findByUserAndCategory(testUser, ExpenseCategory.FOOD, pageable))
            .thenReturn(expectedPage);

        // When
        Page<Expense> actualPage = expenseService.getExpensesByCategory(authentication, ExpenseCategory.FOOD, pageable);

        // Then
        assertThat(actualPage).isEqualTo(expectedPage);
        verify(expenseRepository).findByUserAndCategory(testUser, ExpenseCategory.FOOD, pageable);
    }

    @Test
    @DisplayName("Should throw exception for null category")
    void whenGetExpensesByNullCategory_thenThrowException() {
        // When & Then
        assertThrows(InvalidInputException.class, 
            () -> expenseService.getExpensesByCategory(authentication, null, pageable));
        verify(expenseRepository, never()).findByUserAndCategory(any(), any(), any());
    }

    @Test
    @DisplayName("Should get expenses by date range for authenticated user")
    void whenGetExpensesByDateRangeWithAuth_thenReturnUserExpenses() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(7);
        LocalDate endDate = LocalDate.now();
        List<Expense> dateRangeExpenses = Arrays.asList(testExpense);
        Page<Expense> expectedPage = new PageImpl<>(dateRangeExpenses);
        
        when(expenseRepository.findByUserAndDateBetween(testUser, startDate, endDate, pageable))
            .thenReturn(expectedPage);

        // When
        Page<Expense> actualPage = expenseService.getExpensesByDateRange(authentication, startDate, endDate, pageable);

        // Then
        assertThat(actualPage).isEqualTo(expectedPage);
        verify(expenseRepository).findByUserAndDateBetween(testUser, startDate, endDate, pageable);
    }

    @Test
    @DisplayName("Should throw exception for invalid date range")
    void whenGetExpensesByInvalidDateRange_thenThrowException() {
        // Given
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().minusDays(1); // End before start

        // When & Then
        assertThrows(InvalidInputException.class, 
            () -> expenseService.getExpensesByDateRange(authentication, startDate, endDate, pageable));
    }

    @Test
    @DisplayName("Should throw exception for null start date")
    void whenGetExpensesByNullStartDate_thenThrowException() {
        // Given
        LocalDate endDate = LocalDate.now();

        // When & Then
        assertThrows(InvalidInputException.class, 
            () -> expenseService.getExpensesByDateRange(authentication, null, endDate, pageable));
    }

    @Test
    @DisplayName("Should throw exception for null end date")
    void whenGetExpensesByNullEndDate_thenThrowException() {
        // Given
        LocalDate startDate = LocalDate.now().minusDays(7);

        // When & Then
        assertThrows(InvalidInputException.class, 
            () -> expenseService.getExpensesByDateRange(authentication, startDate, null, pageable));
    }

    @Test
    @DisplayName("Should get monthly summary for authenticated user")
    void whenGetMonthlySummaryWithAuth_thenReturnUserSummary() {
        // Given
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);
        Map<String, Object> summary = new HashMap<>();
        summary.put("year", 2025);
        summary.put("month", 1);
        summary.put("total", new BigDecimal("100.00").doubleValue());
        List<Map<String, Object>> expectedSummary = Collections.singletonList(summary);
        
        when(expenseRepository.getMonthlySummaryByUser(testUser, startDate, endDate))
            .thenReturn(expectedSummary);

        // When
        List<Map<String, Object>> actualSummary = expenseService.getMonthlySummary(authentication, startDate, endDate);

        // Then
        assertThat(actualSummary).isEqualTo(expectedSummary);
        verify(expenseRepository).getMonthlySummaryByUser(testUser, startDate, endDate);
    }

    @Test
    @DisplayName("Should get category summary for authenticated user")
    void whenGetCategorySummaryWithAuth_thenReturnUserSummary() {
        // Given
        Object[] rawResult = {ExpenseCategory.FOOD, new BigDecimal("100.00")};
        List<Object[]> mockRepositoryResult = Collections.singletonList(rawResult);
        when(expenseRepository.getCategorySummaryByUser(testUser)).thenReturn(mockRepositoryResult);

        // When
        List<Map<String, Object>> actualSummary = expenseService.getCategorySummary(authentication);

        // Then
        assertThat(actualSummary).hasSize(1);
        Map<String, Object> resultMap = actualSummary.get(0);
        assertThat(resultMap.get("category")).isEqualTo(ExpenseCategory.FOOD.name());
        assertThat(resultMap.get("total")).isEqualTo(new BigDecimal("100.00"));
        verify(expenseRepository).getCategorySummaryByUser(testUser);
    }

    @Test
    @DisplayName("Should handle user not found gracefully")
    void whenUserNotFound_thenThrowException() {
        // Given
        when(userService.findByUsername("testuser@example.com")).thenReturn(null);

        // When & Then
        assertThrows(RuntimeException.class, 
            () -> expenseService.getAllExpenses(authentication, pageable));
    }

    @Test
    @DisplayName("Should handle non-OAuth2 authentication")
    void whenNonOAuth2Authentication_thenUseAuthName() {
        // Given
        when(authentication.getPrincipal()).thenReturn("testuser@example.com");
        when(authentication.getName()).thenReturn("testuser@example.com");
        
        List<Expense> userExpenses = Arrays.asList(testExpense);
        Page<Expense> expectedPage = new PageImpl<>(userExpenses);
        when(expenseRepository.findByUser(testUser, pageable)).thenReturn(expectedPage);

        // When
        Page<Expense> actualPage = expenseService.getAllExpenses(authentication, pageable);

        // Then
        assertThat(actualPage).isEqualTo(expectedPage);
        verify(userService).findByUsername("testuser@example.com");
    }

}