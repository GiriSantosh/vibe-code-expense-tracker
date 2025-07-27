package com.expensetracker.service;

import com.expensetracker.exception.InvalidInputException;
import com.expensetracker.exception.ResourceNotFoundException;
import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.repository.ExpenseRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Map;
import java.util.HashMap;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ExpenseServiceTest {

    @Mock
    private ExpenseRepository expenseRepository;

    @InjectMocks
    private ExpenseService expenseService;

    @Test
    public void whenGetAllExpenses_thenReturnExpenseList() {
        // given
        Expense expense1 = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        Expense expense2 = new Expense(new BigDecimal("20.00"), ExpenseCategory.TRANSPORTATION, "Bus fare", LocalDate.now());
        List<Expense> expectedExpenses = Arrays.asList(expense1, expense2);
        when(expenseRepository.findAll()).thenReturn(expectedExpenses);

        // when
        List<Expense> actualExpenses = expenseService.getAllExpenses();

        // then
        assertThat(actualExpenses).isEqualTo(expectedExpenses);
        verify(expenseRepository, times(1)).findAll();
    }

    @Test
    public void whenGetExpenseById_thenReturnExpense() {
        // given
        Expense expense = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        when(expenseRepository.findById(1L)).thenReturn(Optional.of(expense));

        // when
        Expense actualExpense = expenseService.getExpenseById(1L);

        // then
        assertThat(actualExpense).isEqualTo(expense);
        verify(expenseRepository, times(1)).findById(1L);
    }

    @Test
    public void whenGetExpenseById_thenThrowResourceNotFoundException() {
        // given
        when(expenseRepository.findById(1L)).thenReturn(Optional.empty());

        // when & then
        assertThrows(ResourceNotFoundException.class, () -> expenseService.getExpenseById(1L));
        verify(expenseRepository, times(1)).findById(1L);
    }

    @Test
    public void whenCreateExpense_thenReturnCreatedExpense() {
        // given
        Expense expense = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        when(expenseRepository.save(any(Expense.class))).thenReturn(expense);

        // when
        Expense createdExpense = expenseService.createExpense(expense);

        // then
        assertThat(createdExpense).isEqualTo(expense);
        verify(expenseRepository, times(1)).save(expense);
    }

    

    @Test
    public void whenDeleteExpense_thenDeleteSuccessfully() {
        // given
        when(expenseRepository.existsById(1L)).thenReturn(true);
        doNothing().when(expenseRepository).deleteById(1L);

        // when
        expenseService.deleteExpense(1L);

        // then
        verify(expenseRepository, times(1)).existsById(1L);
        verify(expenseRepository, times(1)).deleteById(1L);
    }

    @Test
    public void whenDeleteExpense_thenThrowResourceNotFoundException() {
        // given
        when(expenseRepository.existsById(1L)).thenReturn(false);

        // when & then
        assertThrows(ResourceNotFoundException.class, () -> expenseService.deleteExpense(1L));
        verify(expenseRepository, times(1)).existsById(1L);
        verify(expenseRepository, never()).deleteById(anyLong());
    }

    @Test
    public void whenGetExpensesByCategory_thenReturnExpenseList() {
        // given
        Expense expense1 = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        List<Expense> expectedExpenses = Collections.singletonList(expense1);
        when(expenseRepository.findByCategory(ExpenseCategory.FOOD)).thenReturn(expectedExpenses);

        // when
        List<Expense> actualExpenses = expenseService.getExpensesByCategory(ExpenseCategory.FOOD);

        // then
        assertThat(actualExpenses).isEqualTo(expectedExpenses);
        verify(expenseRepository, times(1)).findByCategory(ExpenseCategory.FOOD);
    }

    @Test
    public void whenGetExpensesByCategoryWithNullCategory_thenThrowInvalidInputException() {
        assertThrows(InvalidInputException.class, () -> expenseService.getExpensesByCategory(null));
        verify(expenseRepository, never()).findByCategory(any(ExpenseCategory.class));
    }

    @Test
    public void whenGetExpensesByDateRange_thenReturnExpenseList() {
        // given
        LocalDate startDate = LocalDate.now().minusDays(1);
        LocalDate endDate = LocalDate.now();
        Expense expense1 = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", startDate);
        List<Expense> expectedExpenses = Collections.singletonList(expense1);
        when(expenseRepository.findByDateBetween(startDate, endDate)).thenReturn(expectedExpenses);

        // when
        List<Expense> actualExpenses = expenseService.getExpensesByDateRange(startDate, endDate);

        // then
        assertThat(actualExpenses).isEqualTo(expectedExpenses);
        verify(expenseRepository, times(1)).findByDateBetween(startDate, endDate);
    }

    @Test
    public void whenGetExpensesByDateRangeWithNullStartDate_thenThrowInvalidInputException() {
        LocalDate endDate = LocalDate.now();
        assertThrows(InvalidInputException.class, () -> expenseService.getExpensesByDateRange(null, endDate));
        verify(expenseRepository, never()).findByDateBetween(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    public void whenGetExpensesByDateRangeWithNullEndDate_thenThrowInvalidInputException() {
        LocalDate startDate = LocalDate.now();
        assertThrows(InvalidInputException.class, () -> expenseService.getExpensesByDateRange(startDate, null));
        verify(expenseRepository, never()).findByDateBetween(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    public void whenGetExpensesByDateRangeWithStartDateAfterEndDate_thenThrowInvalidInputException() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().minusDays(1);
        assertThrows(InvalidInputException.class, () -> expenseService.getExpensesByDateRange(startDate, endDate));
        verify(expenseRepository, never()).findByDateBetween(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    public void whenGetMonthlySummary_thenReturnSummaryList() {
        // given
        LocalDate startDate = LocalDate.of(2025, 1, 1);
        LocalDate endDate = LocalDate.of(2025, 1, 31);
        Map<String, Object> summary = new HashMap<>();
        summary.put("year", 2025);
        summary.put("month", 1);
        summary.put("total", new BigDecimal("100.00").doubleValue());
        List<Map<String, Object>> expectedSummary = Collections.singletonList(summary);
        when(expenseRepository.getMonthlySummary(startDate, endDate)).thenReturn(expectedSummary);

        // when
        List<Map<String, Object>> actualSummary = expenseService.getMonthlySummary(startDate, endDate);

        // then
        assertThat(actualSummary).isEqualTo(expectedSummary);
        verify(expenseRepository, times(1)).getMonthlySummary(startDate, endDate);
    }

    @Test
    public void whenGetMonthlySummaryWithNullStartDate_thenThrowInvalidInputException() {
        LocalDate endDate = LocalDate.now();
        assertThrows(InvalidInputException.class, () -> expenseService.getMonthlySummary(null, endDate));
        verify(expenseRepository, never()).getMonthlySummary(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    public void whenGetMonthlySummaryWithNullEndDate_thenThrowInvalidInputException() {
        LocalDate startDate = LocalDate.now();
        assertThrows(InvalidInputException.class, () -> expenseService.getMonthlySummary(startDate, null));
        verify(expenseRepository, never()).getMonthlySummary(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    public void whenGetMonthlySummaryWithStartDateAfterEndDate_thenThrowInvalidInputException() {
        LocalDate startDate = LocalDate.now();
        LocalDate endDate = LocalDate.now().minusDays(1);
        assertThrows(InvalidInputException.class, () -> expenseService.getMonthlySummary(startDate, endDate));
        verify(expenseRepository, never()).getMonthlySummary(any(LocalDate.class), any(LocalDate.class));
    }

    @Test
    public void whenGetCategorySummary_thenReturnSummaryList() {
        // given
        Map<String, Object> expectedMap = new HashMap<>();
        expectedMap.put("category", ExpenseCategory.FOOD.name());
        expectedMap.put("total", new BigDecimal("100.00"));
        List<Map<String, Object>> expectedSummary = Collections.singletonList(expectedMap);

        Object[] rawResult = {ExpenseCategory.FOOD, new BigDecimal("100.00")};
        List<Object[]> mockRepositoryResult = Collections.singletonList(rawResult);

        when(expenseRepository.getCategorySummary()).thenReturn(mockRepositoryResult);

        // when
        List<Map<String, Object>> actualSummary = expenseService.getCategorySummary();

        // then
        assertThat(actualSummary).isEqualTo(expectedSummary);
        verify(expenseRepository, times(1)).getCategorySummary();
    }
}