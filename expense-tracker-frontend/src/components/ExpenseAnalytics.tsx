import React from 'react';
import {
  FolderOpen,
  UtensilsCrossed,
  Car,
  Heart,
  Home,
  ShoppingBag,
  GraduationCap,
  Gamepad2,
  DollarSign,
} from 'lucide-react';
import { Avatar, AvatarFallback } from './ui/avatar';
import { CategorySummary } from '../types/Analytics';

interface ExpenseAnalyticsProps {
  categorySummary: CategorySummary[];
}

// Category icon mapping
const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: React.ReactElement } = {
    FOOD: <UtensilsCrossed className="h-4 w-4" />,
    TRANSPORTATION: <Car className="h-4 w-4" />,
    HEALTHCARE: <Heart className="h-4 w-4" />,
    HOUSING: <Home className="h-4 w-4" />,
    SHOPPING: <ShoppingBag className="h-4 w-4" />,
    EDUCATION: <GraduationCap className="h-4 w-4" />,
    ENTERTAINMENT: <Gamepad2 className="h-4 w-4" />,
    FINANCIAL_SERVICES: <DollarSign className="h-4 w-4" />,
  };
  
  return iconMap[category] || <FolderOpen className="h-4 w-4" />;
};

// Category color mapping
const getCategoryColor = (category: string, index: number) => {
  const colorMap: { [key: string]: string } = {
    FOOD: '#FF6B6B',
    TRANSPORTATION: '#4ECDC4', 
    HEALTHCARE: '#45B7D1',
    HOUSING: '#96CEB4',
    SHOPPING: '#FECA57',
    EDUCATION: '#6C5CE7',
    ENTERTAINMENT: '#FD79A8',
    FINANCIAL_SERVICES: '#A29BFE',
  };
  
  const fallbackColors = ['#1976d2', '#388e3c', '#f57c00', '#d32f2f', '#7b1fa2', '#00796b'];
  
  return colorMap[category] || fallbackColors[index % fallbackColors.length];
};

// Format category name for display
const formatCategoryName = (category: string) => {
  return category
    .toLowerCase()
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const ExpenseAnalytics: React.FC<ExpenseAnalyticsProps> = ({ categorySummary }) => {
  const safeCategorySummary = categorySummary || [];
  
  // Calculate total amount for percentage calculation with proper null checks
  const totalAmount = safeCategorySummary.reduce((sum, item) => {
    return sum + (item?.totalAmount || 0);
  }, 0);
  
  // Sort categories by amount (highest first) and calculate percentages
  const sortedCategories = safeCategorySummary
    .map(item => ({
      ...item,
      percentage: totalAmount > 0 ? (item.totalAmount / totalAmount) * 100 : 0,
    }))
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 6); // Limit to top 6 categories

  if (safeCategorySummary.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8">
        <FolderOpen className="h-16 w-16 text-muted-foreground/50 mb-4" />
        <h3 className="text-lg font-medium text-muted-foreground mb-2">
          No expense data available yet
        </h3>
        <p className="text-sm text-muted-foreground text-center">
          Start tracking expenses to see category breakdown
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {sortedCategories.map((category, index) => {
          const categoryColor = getCategoryColor(category.category, index);
          
          return (
            <div 
              key={category.category}
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
            >
              {/* Category Icon */}
              <Avatar className="h-10 w-10" style={{ backgroundColor: categoryColor }}>
                <AvatarFallback style={{ backgroundColor: categoryColor, color: 'white' }}>
                  {getCategoryIcon(category.category)}
                </AvatarFallback>
              </Avatar>
              
              {/* Category Info */}
              <div className="min-w-[140px]">
                <h4 className="text-sm font-medium text-foreground">
                  {formatCategoryName(category.category)}
                </h4>
                <p className="text-xs text-muted-foreground">
                  ${category.totalAmount?.toLocaleString() || '0'}
                </p>
              </div>
              
              {/* Progress Bar */}
              <div className="flex-1 mx-2">
                <div className="relative h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className="h-full w-full flex-1 transition-all"
                    style={{
                      backgroundColor: categoryColor,
                      transform: `translateX(-${100 - (category.percentage || 0)}%)`
                    }}
                  />
                </div>
              </div>
              
              {/* Percentage */}
              <div className="min-w-[50px] text-right">
                <span className="text-sm font-medium text-muted-foreground">
                  {category.percentage.toFixed(1)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Summary Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-border">
        <p className="text-sm text-muted-foreground">
          Total Categories: {safeCategorySummary.length}
        </p>
        <p className="text-sm font-semibold">
          Total Spent: ${totalAmount?.toLocaleString() || '0'}
        </p>
      </div>
    </div>
  );
};

export default ExpenseAnalytics;