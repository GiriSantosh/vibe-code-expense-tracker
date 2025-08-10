export interface MonthlySummary {
  year: number;
  month: number;
  total: number;
}

export interface MonthlySummaryFormatted {
  month: string;
  totalAmount: number;
  expenseCount: number;
}

export interface CategorySummary {
  category: string;
  totalAmount: number;
  percentage: number;
}