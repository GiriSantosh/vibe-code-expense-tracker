package com.expensetracker.repository;

import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    // User-aware methods
    Page<Expense> findByUser(User user, Pageable pageable);
    
    Optional<Expense> findByIdAndUser(Long id, User user);
    
    Page<Expense> findByUserAndCategory(User user, ExpenseCategory category, Pageable pageable);
    
    Page<Expense> findByUserAndDateBetween(User user, LocalDate startDate, LocalDate endDate, Pageable pageable);
    
    @Query("SELECT EXTRACT(YEAR FROM e.date) as year, EXTRACT(MONTH FROM e.date) as month, SUM(e.amount) as total FROM Expense e WHERE e.user = :user AND e.date BETWEEN :startDate AND :endDate GROUP BY EXTRACT(YEAR FROM e.date), EXTRACT(MONTH FROM e.date)")
    List<Map<String, Object>> getMonthlySummaryByUser(@Param("user") User user, @Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);
    
    @Query("SELECT e.category, SUM(e.amount) FROM Expense e WHERE e.user = :user GROUP BY e.category")
    List<Object[]> getCategorySummaryByUser(@Param("user") User user);

    // Legacy methods (kept for compatibility)
    Page<Expense> findAll(Pageable pageable);

    Page<Expense> findByCategory(ExpenseCategory category, Pageable pageable);

    Page<Expense> findByDateBetween(LocalDate startDate, LocalDate endDate, Pageable pageable);

    @Query("SELECT EXTRACT(YEAR FROM e.date) as year, EXTRACT(MONTH FROM e.date) as month, SUM(e.amount) as total FROM Expense e WHERE e.date BETWEEN :startDate AND :endDate GROUP BY EXTRACT(YEAR FROM e.date), EXTRACT(MONTH FROM e.date)")
    List<Map<String, Object>> getMonthlySummary(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT e.category, SUM(e.amount) FROM Expense e GROUP BY e.category")
    List<Object[]> getCategorySummary();
}
