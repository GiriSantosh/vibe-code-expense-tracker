package com.expensetracker.repository;

import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    List<Expense> findByCategory(ExpenseCategory category);

    List<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT FUNCTION('YEAR', e.date) as year, FUNCTION('MONTH', e.date) as month, SUM(e.amount) as total FROM Expense e WHERE e.date BETWEEN :startDate AND :endDate GROUP BY year, month")
    List<Map<String, Object>> getMonthlySummary(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e GROUP BY e.category")
    List<Object[]> getCategorySummary();
}
