import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  List,
  ListItem,
  ListItemText,
  LinearProgress,
  Avatar,
  Stack,
} from '@mui/material';
import {
  Category as CategoryIcon,
  Restaurant as RestaurantIcon,
  DirectionsCar as TransportIcon,
  LocalHospital as HealthIcon,
  Home as HomeIcon,
  ShoppingCart as ShoppingIcon,
  School as EducationIcon,
  SportsEsports as EntertainmentIcon,
  AttachMoney as FinanceIcon,
} from '@mui/icons-material';
import { CategorySummary } from '../types/Analytics';

interface ExpenseAnalyticsProps {
  categorySummary: CategorySummary[];
}

// Category icon mapping
const getCategoryIcon = (category: string) => {
  const iconMap: { [key: string]: React.ReactElement } = {
    FOOD: <RestaurantIcon />,
    TRANSPORTATION: <TransportIcon />,
    HEALTHCARE: <HealthIcon />,
    HOUSING: <HomeIcon />,
    SHOPPING: <ShoppingIcon />,
    EDUCATION: <EducationIcon />,
    ENTERTAINMENT: <EntertainmentIcon />,
    FINANCIAL_SERVICES: <FinanceIcon />,
  };
  
  return iconMap[category] || <CategoryIcon />;
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
      <Card sx={{ height: '100%' }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Expense Analytics
          </Typography>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            py={8}
          >
            <CategoryIcon sx={{ fontSize: 64, color: 'grey.300', mb: 2 }} />
            <Typography variant="body1" color="text.secondary" textAlign="center">
              No expense data available yet
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
              Start tracking expenses to see category breakdown
            </Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="h6" fontWeight={600} gutterBottom>
          Expense Analytics
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Top spending categories this period
        </Typography>
        
        <List sx={{ py: 0 }}>
          {sortedCategories.map((category, index) => {
            const categoryColor = getCategoryColor(category.category, index);
            
            return (
              <ListItem 
                key={category.category} 
                sx={{ 
                  px: 0, 
                  py: 1.5,
                  '&:hover': {
                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                    borderRadius: 1,
                  },
                }}
              >
                <ListItemText>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {/* Category Icon */}
                    <Avatar
                      sx={{
                        width: 40,
                        height: 40,
                        backgroundColor: categoryColor,
                        color: 'white',
                      }}
                    >
                      {getCategoryIcon(category.category)}
                    </Avatar>
                    
                    {/* Category Info */}
                    <Box sx={{ minWidth: 140 }}>
                      <Typography 
                        variant="body1" 
                        fontWeight={500}
                        color="text.primary"
                      >
                        {formatCategoryName(category.category)}
                      </Typography>
                      <Typography 
                        variant="caption" 
                        color="text.secondary"
                      >
                        ${category.totalAmount?.toLocaleString() || '0'}
                      </Typography>
                    </Box>
                    
                    {/* Progress Bar */}
                    <Box sx={{ flex: 1, mx: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={category.percentage}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: 'rgba(0, 0, 0, 0.08)',
                          '& .MuiLinearProgress-bar': {
                            borderRadius: 4,
                            backgroundColor: categoryColor,
                          },
                        }}
                      />
                    </Box>
                    
                    {/* Percentage */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary"
                      fontWeight={600}
                      sx={{ minWidth: 50, textAlign: 'right' }}
                    >
                      {category.percentage.toFixed(1)}%
                    </Typography>
                  </Box>
                </ListItemText>
              </ListItem>
            );
          })}
        </List>
        
        {/* Summary Footer */}
        <Box 
          sx={{ 
            mt: 3, 
            pt: 2, 
            borderTop: 1, 
            borderColor: 'divider',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            Total Categories: {safeCategorySummary.length}
          </Typography>
          <Typography variant="subtitle2" fontWeight={600}>
            Total Spent: ${totalAmount?.toLocaleString() || '0'}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default ExpenseAnalytics;