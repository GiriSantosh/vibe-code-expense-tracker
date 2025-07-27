package com.expensetracker;

import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.repository.ExpenseRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.BEFORE_EACH_TEST_METHOD)
public class ExpenseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ExpenseRepository expenseRepository;

    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        expenseRepository.deleteAll();
        objectMapper = new ObjectMapper();
        objectMapper.registerModule(new JavaTimeModule());
        objectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Test
    void testCreateExpense() throws Exception {
        Expense expense = new Expense(new BigDecimal("50.00"), ExpenseCategory.FOOD, "Dinner", LocalDate.now());

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(expense)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.description").value("Dinner"))
                .andExpect(jsonPath("$.amount").value(50.00));

        assertThat(expenseRepository.findAll()).hasSize(1);
    }

    @Test
    void testGetAllExpenses() throws Exception {
        expenseRepository.save(new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now()));
        expenseRepository.save(new Expense(new BigDecimal("20.00"), ExpenseCategory.TRANSPORTATION, "Bus", LocalDate.now()));

        mockMvc.perform(get("/api/expenses"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.totalPages").value(1))
                .andExpect(jsonPath("$.totalElements").value(2));
    }

    @Test
    void testGetExpenseById() throws Exception {
        Expense savedExpense = expenseRepository.save(new Expense(new BigDecimal("100.00"), ExpenseCategory.ENTERTAINMENT, "Movie", LocalDate.now()));

        mockMvc.perform(get("/api/expenses/" + savedExpense.getId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("Movie"));
    }

    @Test
    void testGetExpenseByIdNotFound() throws Exception {
        mockMvc.perform(get("/api/expenses/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testDeleteExpense() throws Exception {
        Expense savedExpense = expenseRepository.save(new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Delete Me", LocalDate.now()));

        mockMvc.perform(delete("/api/expenses/" + savedExpense.getId()))
                .andExpect(status().isNoContent());

        assertThat(expenseRepository.findById(savedExpense.getId())).isEmpty();
    }

    

    @Test
    void testGetExpensesByCategory() throws Exception {
        expenseRepository.save(new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now()));
        expenseRepository.save(new Expense(new BigDecimal("20.00"), ExpenseCategory.TRANSPORTATION, "Bus", LocalDate.now()));

        mockMvc.perform(get("/api/expenses?category=FOOD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].category").value("FOOD"));
    }

    @Test
    void testGetExpensesByDateRange() throws Exception {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = today.minusDays(1);
        LocalDate tomorrow = today.plusDays(1);

        expenseRepository.save(new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Yesterday", yesterday));
        expenseRepository.save(new Expense(new BigDecimal("20.00"), ExpenseCategory.TRANSPORTATION, "Today", today));
        expenseRepository.save(new Expense(new BigDecimal("30.00"), ExpenseCategory.BILLS, "Tomorrow", tomorrow));

        mockMvc.perform(get("/api/expenses?startDate=" + yesterday + "&endDate=" + today))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(2))
                .andExpect(jsonPath("$.content[0].description").value("Yesterday"))
                .andExpect(jsonPath("$.content[1].description").value("Today"));
    }

    @Test
    void testGetMonthlySummary() throws Exception {
        LocalDate date1 = LocalDate.of(2025, 1, 15);
        LocalDate date2 = LocalDate.of(2025, 1, 20);
        LocalDate date3 = LocalDate.of(2025, 2, 10);

        expenseRepository.save(new Expense(new BigDecimal("100.00"), ExpenseCategory.FOOD, "Jan Expense 1", date1));
        expenseRepository.save(new Expense(new BigDecimal("50.00"), ExpenseCategory.FOOD, "Jan Expense 2", date2));
        expenseRepository.save(new Expense(new BigDecimal("200.00"), ExpenseCategory.BILLS, "Feb Expense 1", date3));

        mockMvc.perform(get("/api/expenses/summary?startDate=2025-01-01&endDate=2025-02-28"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].month").value(1))
                .andExpect(jsonPath("$[0].total").value(150.00))
                .andExpect(jsonPath("$[1].month").value(2))
                .andExpect(jsonPath("$[1].total").value(200.00));
    }

    @Test
    void testGetCategorySummary() throws Exception {
        expenseRepository.save(new Expense(new BigDecimal("100.00"), ExpenseCategory.FOOD, "Food 1", LocalDate.now()));
        expenseRepository.save(new Expense(new BigDecimal("50.00"), ExpenseCategory.FOOD, "Food 2", LocalDate.now()));
        expenseRepository.save(new Expense(new BigDecimal("200.00"), ExpenseCategory.TRANSPORTATION, "Transport 1", LocalDate.now()));

        mockMvc.perform(get("/api/expenses/category-summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[?(@.category == 'FOOD')].total").exists())
                .andExpect(jsonPath("$[?(@.category == 'FOOD')].total").value(150.00))
                .andExpect(jsonPath("$[?(@.category == 'TRANSPORTATION')].total").exists())
                .andExpect(jsonPath("$[?(@.category == 'TRANSPORTATION')].total").value(200.00));
    }

    @Test
    void testDeleteExpenseNotFound() throws Exception {
        mockMvc.perform(delete("/api/expenses/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void testCreateExpenseWithInvalidData() throws Exception {
        // Expense with null amount (validation should fail)
        Expense invalidExpense = new Expense(null, ExpenseCategory.FOOD, "Invalid", LocalDate.now());

        mockMvc.perform(post("/api/expenses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalidExpense)))
                .andExpect(status().isBadRequest());
    }
}
