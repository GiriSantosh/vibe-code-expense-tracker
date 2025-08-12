import React from 'react';
import {
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { MonthlySummaryFormatted } from '../types/Analytics';

interface ExpenseSummaryProps {
  monthlySummary: MonthlySummaryFormatted[];
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({ monthlySummary }) => {
  // Defensive check for undefined/null monthlySummary
  const safeMonthlySummary = monthlySummary || [];
  console.log('ExpenseSummary received monthlySummary:', safeMonthlySummary);
  
  // Calculate total and find highest month
  const totalAmount = safeMonthlySummary.reduce((acc, summary) => acc + (summary.totalAmount || 0), 0);
  const highestMonth = safeMonthlySummary.reduce((max, current) => 
    (current.totalAmount || 0) > (max.totalAmount || 0) ? current : max, safeMonthlySummary[0] || {});
  
  console.log('ExpenseSummary calculated totalAmount:', totalAmount);
  console.log('ExpenseSummary found highestMonth:', highestMonth);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <TrendingUp className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-primary">
          Monthly Summary
        </h3>
        <Badge variant="outline">
          {safeMonthlySummary.length} months
        </Badge>
      </div>
      
      {safeMonthlySummary.length === 0 ? (
        <div className="text-center py-8">
          <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h4 className="text-lg font-medium text-muted-foreground mb-2">
            No monthly summary available
          </h4>
          <p className="text-sm text-muted-foreground">
            Start adding expenses to see your monthly trends
          </p>
        </div>
      ) : (
        <>
          {/* Summary Stats */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 text-center p-4 bg-primary/5 rounded-lg">
              <h4 className="text-2xl font-bold text-primary mb-1">
                ${totalAmount.toFixed(2)}
              </h4>
              <p className="text-sm text-muted-foreground">
                Total Expenses
              </p>
            </div>
            <div className="flex-1 text-center p-4 bg-green-50 rounded-lg">
              <h4 className="text-lg font-bold text-green-600 mb-1">
                {highestMonth.month || 'N/A'}
              </h4>
              <p className="text-sm text-muted-foreground">
                Highest Spending Month
              </p>
            </div>
          </div>
          
          {/* Monthly Breakdown */}
          <div>
            <h4 className="text-base font-semibold mb-3">
              Monthly Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {safeMonthlySummary.map((summary, index) => {
                const percentage = totalAmount > 0 ? (summary.totalAmount || 0) / totalAmount * 100 : 0;
                return (
                  <Card 
                    key={index}
                    className="transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  >
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h5 className="text-sm font-semibold">
                          {summary.month}
                        </h5>
                        <span className="text-lg font-bold text-primary">
                          ${summary.totalAmount ? summary.totalAmount.toFixed(2) : '0.00'}
                        </span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2 mb-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {percentage.toFixed(1)}% of total
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseSummary;