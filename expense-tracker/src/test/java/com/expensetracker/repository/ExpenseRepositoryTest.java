package com.expensetracker.repository;

import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
public class ExpenseRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ExpenseRepository expenseRepository;

    @Test
    public void whenFindByCategory_thenReturnExpenses() {
        // given
        Expense expense = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        entityManager.persist(expense);
        entityManager.flush();
        Pageable pageable = PageRequest.of(0, 10);

        // when
        Page<Expense> found = expenseRepository.findByCategory(ExpenseCategory.FOOD, pageable);

        // then
        assertThat(found.getContent()).hasSize(1);
        assertThat(found.getContent().get(0).getCategory()).isEqualTo(ExpenseCategory.FOOD);
    }

    @Test
    public void whenFindByDateBetween_thenReturnExpenses() {
        // given
        Expense expense1 = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now().minusDays(1));
        Expense expense2 = new Expense(new BigDecimal("20.00"), ExpenseCategory.TRANSPORTATION, "Bus fare", LocalDate.now());
        entityManager.persist(expense1);
        entityManager.persist(expense2);
        entityManager.flush();
        Pageable pageable = PageRequest.of(0, 10);

        // when
        Page<Expense> found = expenseRepository.findByDateBetween(LocalDate.now().minusDays(2), LocalDate.now(), pageable);

        // then
        assertThat(found.getContent()).hasSize(2);
    }

    @Test
    public void whenGetMonthlySummary_thenReturnCorrectSummary() {
        // given
        LocalDate date1 = LocalDate.of(2025, 1, 15);
        LocalDate date2 = LocalDate.of(2025, 1, 20);
        LocalDate date3 = LocalDate.of(2025, 2, 10);

        entityManager.persist(new Expense(new BigDecimal("100.00"), ExpenseCategory.FOOD, "Jan Expense 1", date1));
        entityManager.persist(new Expense(new BigDecimal("50.00"), ExpenseCategory.FOOD, "Jan Expense 2", date2));
        entityManager.persist(new Expense(new BigDecimal("200.00"), ExpenseCategory.BILLS, "Feb Expense 1", date3));
        entityManager.flush();

        // when
        List<Map<String, Object>> summary = expenseRepository.getMonthlySummary(LocalDate.of(2025, 1, 1), LocalDate.of(2025, 2, 28));

        // then
        assertThat(summary).hasSize(2);

        Map<String, Object> janSummary = summary.stream()
                .filter(s -> (Integer) s.get("month") == 1)
                .findFirst().orElse(null);
        assertThat(janSummary).isNotNull();
        assertThat(janSummary.get("year")).isEqualTo(2025);
        assertThat(janSummary.get("total")).isEqualTo(new BigDecimal("150.00"));

        Map<String, Object> febSummary = summary.stream()
                .filter(s -> (Integer) s.get("month") == 2)
                .findFirst().orElse(null);
        assertThat(febSummary).isNotNull();
        assertThat(febSummary.get("year")).isEqualTo(2025);
        assertThat(febSummary.get("total")).isEqualTo(new BigDecimal("200.00"));
    }

    @Test
    public void whenGetCategorySummary_thenReturnCorrectSummary() {
        // given
        entityManager.persist(new Expense(new BigDecimal("100.00"), ExpenseCategory.FOOD, "Food 1", LocalDate.now()));
        entityManager.persist(new Expense(new BigDecimal("50.00"), ExpenseCategory.FOOD, "Food 2", LocalDate.now()));
        entityManager.persist(new Expense(new BigDecimal("200.00"), ExpenseCategory.TRANSPORTATION, "Transport 1", LocalDate.now()));
        entityManager.flush();

        // when
        List<Object[]> summary = expenseRepository.getCategorySummary();

        // then
        assertThat(summary).hasSize(2);

        Object[] foodSummary = summary.stream()
                .filter(s -> s[0].equals(ExpenseCategory.FOOD))
                .findFirst().orElse(null);
        assertThat(foodSummary).isNotNull();
        assertThat(foodSummary[1]).isEqualTo(new BigDecimal("150.00"));

        Object[] transportationSummary = summary.stream()
                .filter(s -> s[0].equals(ExpenseCategory.TRANSPORTATION))
                .findFirst().orElse(null);
        assertThat(transportationSummary).isNotNull();
        assertThat(transportationSummary[1]).isEqualTo(new BigDecimal("200.00"));
    }
}
