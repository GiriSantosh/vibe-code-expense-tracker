import React, { useEffect } from 'react';
import {
  Plus,
  Filter,
  TrendingUp,
  List,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useExpenses } from '../hooks/useExpenses';
import ExpenseForm from './ExpenseForm';
import { ExpenseDataTable, createColumns } from './expenses';
import ExpenseSummary from './ExpenseSummary';
import CategoryPieChart from './CategoryPieChart';
import FilterControls from './FilterControls';
import MonthlySplineChart from './MonthlySplineChart';
import { ExpenseCategory } from '../types/ExpenseCategory';

export const ExpenseManagement: React.FC = () => {
  const { 
    expenses, 
    monthlySummary, 
    categorySummary, 
    loading, 
    error, 
    fetchExpenses, 
    addExpense, 
    deleteExpense, 
    fetchMonthlySummary, 
    totalElements 
  } = useExpenses();
  

  useEffect(() => {
    fetchExpenses();
  }, []);

  const handleAddExpense = async (expense: any) => {
    try {
      await addExpense(expense);
      fetchExpenses();
    } catch (err) {
      console.error('Error adding expense:', err);
    }
  };

  const handleDeleteExpense = async (id: number) => {
    try {
      await deleteExpense(id);
      fetchExpenses();
    } catch (err) {
      console.error('Error deleting expense:', err);
    }
  };

  const handleFilterExpenses = (category?: ExpenseCategory, startDate?: string, endDate?: string) => {
    fetchExpenses(category, startDate, endDate);
    fetchMonthlySummary(startDate, endDate);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg font-semibold text-primary mt-4">
          Loading expense data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
          <div>
            <h3 className="font-medium text-red-800">
              Error loading expense data
            </h3>
            <p className="text-sm text-red-700 mt-1">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">
          Expense Management
        </h1>
        <p className="text-muted-foreground">
          Track, categorize, and analyze your personal expenses
        </p>
      </div>

      {/* Add Expense Form and Summary */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add New Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseForm onSubmit={handleAddExpense} isLoading={loading} />
            </CardContent>
          </Card>
        </div>
        <div>
          <Card>
            <CardContent className="pt-6">
              <ExpenseSummary monthlySummary={monthlySummary} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter Expenses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FilterControls onFilter={handleFilterExpenses} />
        </CardContent>
      </Card>

      {/* Expense List and Category Chart */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Expense List
                </CardTitle>
                <Badge variant="outline">
                  {totalElements} total expenses
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <ExpenseDataTable 
                columns={createColumns(handleDeleteExpense)} 
                data={expenses} 
                onDelete={handleDeleteExpense}
                loading={loading}
              />
            </CardContent>
          </Card>
        </div>
        
        <div>
          <CategoryPieChart categorySummary={categorySummary} />
        </div>
      </div>

      {/* Monthly Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Monthly Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <MonthlySplineChart monthlySummary={monthlySummary} />
        </CardContent>
      </Card>
    </div>
  );
};