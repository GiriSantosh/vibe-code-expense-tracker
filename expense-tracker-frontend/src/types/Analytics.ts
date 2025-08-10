export interface MonthlySummary {
  month: string;
  totalAmount: number;
  expenseCount: number;
}

export interface CategorySummary {
  category: string;
  totalAmount: number;
  percentage: number;
}