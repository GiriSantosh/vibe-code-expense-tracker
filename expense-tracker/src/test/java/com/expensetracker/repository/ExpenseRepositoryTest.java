package com.expensetracker.repository;

import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.model.User;
import com.expensetracker.model.UserPreferences;
import org.junit.jupiter.api.BeforeEach;
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
import org.springframework.test.context.ActiveProfiles;

@DataJpaTest
@ActiveProfiles("test")
public class ExpenseRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private ExpenseRepository expenseRepository;

    private User testUser;

    @BeforeEach
    void setUp() {
        // Create and persist a test user
        testUser = new User("testuser@example.com", "test@example.com", "Test", "User");
        UserPreferences preferences = new UserPreferences(testUser);
        testUser.setPreferences(preferences);
        testUser = entityManager.persist(testUser);
        entityManager.flush();
    }

    @Test
    public void whenFindByUserAndCategory_thenReturnExpenses() {
        // given
        Expense expense = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        expense.setUser(testUser);
        entityManager.persist(expense);
        entityManager.flush();
        Pageable pageable = PageRequest.of(0, 10);

        // when
        Page<Expense> found = expenseRepository.findByUserAndCategory(testUser, ExpenseCategory.FOOD, pageable);

        // then
        assertThat(found.getContent()).hasSize(1);
        assertThat(found.getContent().get(0).getCategory()).isEqualTo(ExpenseCategory.FOOD);
        assertThat(found.getContent().get(0).getUser()).isEqualTo(testUser);
    }

    @Test
    public void whenFindByUserAndDateBetween_thenReturnExpenses() {
        // given
        Expense expense1 = new Expense(new BigDecimal("10.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now().minusDays(1));
        expense1.setUser(testUser);
        Expense expense2 = new Expense(new BigDecimal("20.00"), ExpenseCategory.TRANSPORTATION, "Bus fare", LocalDate.now());
        expense2.setUser(testUser);
        entityManager.persist(expense1);
        entityManager.persist(expense2);
        entityManager.flush();
        Pageable pageable = PageRequest.of(0, 10);

        // when
        Page<Expense> found = expenseRepository.findByUserAndDateBetween(testUser, LocalDate.now().minusDays(2), LocalDate.now(), pageable);

        // then
        assertThat(found.getContent()).hasSize(2);
        assertThat(found.getContent()).allMatch(expense -> expense.getUser().equals(testUser));
    }

    @Test
    public void whenGetMonthlySummaryByUser_thenReturnCorrectSummary() {
        // given
        LocalDate date1 = LocalDate.of(2025, 1, 15);
        LocalDate date2 = LocalDate.of(2025, 1, 20);
        LocalDate date3 = LocalDate.of(2025, 2, 10);

        Expense expense1 = new Expense(new BigDecimal("100.00"), ExpenseCategory.FOOD, "Jan Expense 1", date1);
        expense1.setUser(testUser);
        Expense expense2 = new Expense(new BigDecimal("50.00"), ExpenseCategory.FOOD, "Jan Expense 2", date2);
        expense2.setUser(testUser);
        Expense expense3 = new Expense(new BigDecimal("200.00"), ExpenseCategory.BILLS, "Feb Expense 1", date3);
        expense3.setUser(testUser);

        entityManager.persist(expense1);
        entityManager.persist(expense2);
        entityManager.persist(expense3);
        entityManager.flush();

        // when
        List<Map<String, Object>> summary = expenseRepository.getMonthlySummaryByUser(testUser, LocalDate.of(2025, 1, 1), LocalDate.of(2025, 2, 28));

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
    public void whenGetCategorySummaryByUser_thenReturnCorrectSummary() {
        // given
        Expense expense1 = new Expense(new BigDecimal("100.00"), ExpenseCategory.FOOD, "Food 1", LocalDate.now());
        expense1.setUser(testUser);
        Expense expense2 = new Expense(new BigDecimal("50.00"), ExpenseCategory.FOOD, "Food 2", LocalDate.now());
        expense2.setUser(testUser);
        Expense expense3 = new Expense(new BigDecimal("200.00"), ExpenseCategory.TRANSPORTATION, "Transport 1", LocalDate.now());
        expense3.setUser(testUser);

        entityManager.persist(expense1);
        entityManager.persist(expense2);
        entityManager.persist(expense3);
        entityManager.flush();

        // when
        List<Object[]> summary = expenseRepository.getCategorySummaryByUser(testUser);

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

    @Test
    public void whenFindByUser_thenReturnUserExpenses() {
        // given
        Expense expense1 = new Expense(new BigDecimal("25.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        expense1.setUser(testUser);
        Expense expense2 = new Expense(new BigDecimal("15.00"), ExpenseCategory.TRANSPORTATION, "Bus", LocalDate.now());
        expense2.setUser(testUser);

        entityManager.persist(expense1);
        entityManager.persist(expense2);
        entityManager.flush();
        Pageable pageable = PageRequest.of(0, 10);

        // when
        Page<Expense> found = expenseRepository.findByUser(testUser, pageable);

        // then
        assertThat(found.getContent()).hasSize(2);
        assertThat(found.getContent()).allMatch(expense -> expense.getUser().equals(testUser));
    }

    @Test
    public void whenFindByIdAndUser_thenReturnExpense() {
        // given
        Expense expense = new Expense(new BigDecimal("25.00"), ExpenseCategory.FOOD, "Lunch", LocalDate.now());
        expense.setUser(testUser);
        Expense savedExpense = entityManager.persist(expense);
        entityManager.flush();

        // when
        var found = expenseRepository.findByIdAndUser(savedExpense.getId(), testUser);

        // then
        assertThat(found).isPresent();
        assertThat(found.get().getUser()).isEqualTo(testUser);
        assertThat(found.get().getDescription()).isEqualTo("Lunch");
    }
}