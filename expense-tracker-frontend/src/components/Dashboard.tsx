import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Eye, 
  Download,
  DollarSign, 
  Receipt, 
  FolderOpen, 
  Calendar, 
  MoreVertical,
  ChevronUp,
  ChevronDown,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import ExpenseSummary from './ExpenseSummary';
import ExpenseAnalytics from './ExpenseAnalytics';
import { ExpenseDataTable, createColumns } from './expenses';
import { useAuth } from '../context/AuthContext';
import { useExpenses } from '../hooks/useExpenses';

interface MetricCardProps {
  title: string;
  value: string;
  change?: string;
  trend?: 'up' | 'down';
  icon: React.ReactNode;
  variant?: 'primary' | 'success' | 'warning' | 'destructive';
}

const MetricCard: React.FC<MetricCardProps> = ({ 
  title, 
  value, 
  change, 
  trend, 
  icon, 
  variant = 'primary' 
}) => {
  const variantStyles = {
    primary: 'border-primary/20 bg-primary/5 hover:bg-primary/10',
    success: 'border-green-200 bg-green-50 hover:bg-green-100',
    warning: 'border-orange-200 bg-orange-50 hover:bg-orange-100',
    destructive: 'border-red-200 bg-red-50 hover:bg-red-100'
  };

  const iconStyles = {
    primary: 'bg-primary text-primary-foreground',
    success: 'bg-green-500 text-white',
    warning: 'bg-orange-500 text-white',
    destructive: 'bg-red-500 text-white'
  };

  return (
    <Card className={cn(
      'transition-all duration-300 hover:-translate-y-1 hover:shadow-lg',
      variantStyles[variant]
    )}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">
              {title}
            </p>
            <p className="text-2xl font-bold mb-1">
              {value}
            </p>
            {change && (
              <div className="flex items-center gap-1">
                {trend === 'up' ? (
                  <ChevronUp className="h-4 w-4 text-green-600" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-red-600" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  trend === 'up' ? 'text-green-600' : 'text-red-600'
                )}>
                  {change}
                </span>
                <span className="text-xs text-muted-foreground">
                  from last month
                </span>
              </div>
            )}
          </div>
          <div className={cn(
            'p-3 rounded-lg',
            iconStyles[variant]
          )}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    expenses, 
    monthlySummary, 
    categorySummary, 
    loading, 
    error,
    deleteExpense,
    totalElements 
  } = useExpenses();


  // Get recent expenses (first 5)
  const recentExpenses = expenses.slice(0, 5);

  // Calculate metrics with proper null checks
  const totalExpenseAmount = monthlySummary?.reduce((sum, month) => sum + (month?.totalAmount || 0), 0) || 0;
  const currentMonth = monthlySummary?.[monthlySummary.length - 1];
  const previousMonth = monthlySummary?.[monthlySummary.length - 2];
  const monthlyChange = currentMonth?.totalAmount && previousMonth?.totalAmount 
    ? ((currentMonth.totalAmount - previousMonth.totalAmount) / previousMonth.totalAmount * 100).toFixed(1)
    : null;
  
  const topCategory = categorySummary?.reduce((max, category) => {
    const categoryAmount = category?.totalAmount || 0;
    const maxAmount = max?.totalAmount || 0;
    return categoryAmount > maxAmount ? category : max;
  }, categorySummary[0] || null);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add':
        navigate('/expenses');
        break;
      case 'view':
        navigate('/expenses');
        break;
      case 'export':
        alert('Export functionality coming soon!');
        break;
      default:
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
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
              Error loading dashboard
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.firstName || user?.username || 'User'}!
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your expenses today.
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Expenses"
          value={`$${totalExpenseAmount?.toLocaleString() || '0'}`}
          change={monthlyChange ? `${monthlyChange}%` : undefined}
          trend={monthlyChange && parseFloat(monthlyChange) > 0 ? 'up' : 'down'}
          icon={<DollarSign className="h-6 w-6" />}
          variant="primary"
        />
        <MetricCard
          title="This Month"
          value={`$${currentMonth?.totalAmount?.toLocaleString() || '0'}`}
          change="12.5%"
          trend="up"
          icon={<Calendar className="h-6 w-6" />}
          variant="success"
        />
        <MetricCard
          title="Total Transactions"
          value={totalElements?.toString() || '0'}
          icon={<Receipt className="h-6 w-6" />}
          variant="warning"
        />
        <MetricCard
          title="Top Category"
          value={topCategory?.category?.replace('_', ' ') || 'N/A'}
          icon={<FolderOpen className="h-6 w-6" />}
          variant="destructive"
        />
      </div>

      {/* Charts and Data */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Expense Chart - Takes 2 columns */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-semibold">
                  Expense Analytics
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Category breakdown for this period
                </p>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ExpenseAnalytics categorySummary={categorySummary} />
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold">
              Quick Actions
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              Manage your expenses efficiently
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              className="w-full justify-start"
              onClick={() => handleQuickAction('add')}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add New Expense
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickAction('view')}
            >
              <Eye className="mr-2 h-4 w-4" />
              View All ({totalElements})
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => handleQuickAction('export')}
            >
              <Download className="mr-2 h-4 w-4" />
              Export Data
            </Button>

            {/* Quick Stats */}
            <div className="mt-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">
                Monthly Summary
              </h4>
              <ExpenseSummary monthlySummary={monthlySummary} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-semibold">
                Recent Transactions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Your latest expense activities
              </p>
            </div>
            <Button
              variant="ghost"
              onClick={() => navigate('/expenses')}
            >
              View All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {recentExpenses.length > 0 ? (
            <ExpenseDataTable 
              columns={createColumns(deleteExpense)} 
              data={recentExpenses} 
              onDelete={deleteExpense}
              loading={loading}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Receipt className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground mb-2">
                No expenses yet
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-4">
                Start tracking your expenses to see them here
              </p>
              <Button onClick={() => navigate('/expenses')}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Expense
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};