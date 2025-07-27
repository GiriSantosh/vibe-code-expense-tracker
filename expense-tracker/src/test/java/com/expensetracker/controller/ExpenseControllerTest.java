package com.expensetracker.controller;

import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.service.ExpenseService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import com.expensetracker.exception.InvalidInputException;
import com.expensetracker.exception.ResourceNotFoundException;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.doThrow;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ExpenseController.class)
public class ExpenseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private ExpenseService expenseService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void whenGetAllExpenses_thenReturnJsonArray() throws Exception {
        // given
        Expense expense1 = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        Expense expense2 = new Expense(new BigDecimal("20.00"), ExpenseCategory.TRANSPORTATION, "Bus fare", LocalDate.now());
        Page<Expense> allExpensesPage = new PageImpl<>(Arrays.asList(expense1, expense2));
        when(expenseService.getAllExpenses(any(Pageable.class))).thenReturn(allExpensesPage);

        // when & then
        mockMvc.perform(get("/api/expenses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].description").value("Lunch"))
                .andExpect(jsonPath("$.content[1].description").value("Bus fare"))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    public void whenPostExpense_thenReturnCreatedExpense() throws Exception {
        // given
        Expense expense = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        when(expenseService.createExpense(any(Expense.class))).thenReturn(expense);

        // when & then
        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(expense)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value("Lunch"));
    }

    @Test
    public void whenPostExpense_thenReturnsBadRequest() throws Exception {
        // given
        Expense expense = new Expense(new BigDecimal("-10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now()); // Invalid amount
        when(expenseService.createExpense(any(Expense.class))).thenThrow(new InvalidInputException("Amount must be positive"));

        // when & then
        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(expense)))
                .andExpect(status().isBadRequest());
    }

    @Test
    public void whenGetExpenseById_thenReturnExpense() throws Exception {
        // given
        Expense expense = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        when(expenseService.getExpenseById(1L)).thenReturn(expense);

        // when & then
        mockMvc.perform(get("/api/expenses/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Lunch"));
    }

    @Test
    public void whenGetExpenseById_thenReturnsNotFound() throws Exception {
        // given
        when(expenseService.getExpenseById(1L)).thenThrow(new ResourceNotFoundException("Expense not found"));

        // when & then
        mockMvc.perform(get("/api/expenses/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    public void whenDeleteExpense_thenReturnNoContent() throws Exception {
        // when & then
        mockMvc.perform(delete("/api/expenses/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    public void whenDeleteExpense_thenReturnsNotFound() throws Exception {
        // given
        doThrow(new ResourceNotFoundException("Expense not found")).when(expenseService).deleteExpense(1L);

        // when & then
        mockMvc.perform(delete("/api/expenses/1"))
                .andExpect(status().isNotFound());
    }
}
