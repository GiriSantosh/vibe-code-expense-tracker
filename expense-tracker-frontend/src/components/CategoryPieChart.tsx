import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from './ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from './ui/chart';
import { CategorySummary } from '../types/Analytics';
import { PieChart as PieChartIcon } from 'lucide-react';

interface CategoryPieChartProps {
  categorySummary: CategorySummary[];
}

const categoryColors: Record<string, string> = {
  FOOD: 'hsl(var(--chart-1))',
  TRANSPORTATION: 'hsl(var(--chart-2))',
  ENTERTAINMENT: 'hsl(var(--chart-3))',
  HEALTHCARE: 'hsl(var(--chart-4))',
  UTILITIES: 'hsl(var(--chart-5))',
  SHOPPING: 'hsl(12 76% 61%)',
  EDUCATION: 'hsl(173 58% 39%)',
  OTHER: 'hsl(197 37% 24%)',
};

const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ categorySummary }) => {
  const safeCategorySummary = categorySummary || [];
  
  // Transform data for Recharts
  const chartData = safeCategorySummary.map((item, index) => ({
    category: item.category,
    amount: item.totalAmount,
    percentage: item.percentage || 0,
    fill: categoryColors[item.category] || `hsl(${index * 60} 70% 50%)`,
  }));

  // Create chart config
  const chartConfig = safeCategorySummary.reduce((config, item) => {
    const categoryKey = item.category.toLowerCase();
    config[categoryKey] = {
      label: item.category.charAt(0) + item.category.slice(1).toLowerCase().replace('_', ' '),
      color: categoryColors[item.category] || 'hsl(var(--chart-1))',
    };
    return config;
  }, {} as ChartConfig);


  const totalAmount = chartData.reduce((sum, item) => sum + item.amount, 0);

  if (chartData.length === 0) {
    return (
      <Card className="flex flex-col">
        <CardHeader className="items-center pb-0">
          <CardTitle className="flex items-center gap-2">
            <PieChartIcon className="h-5 w-5" />
            Category Breakdown
          </CardTitle>
          <CardDescription>No category data available</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 pb-0">
          <div className="mx-auto aspect-square max-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <PieChartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-sm text-muted-foreground">
                Start adding expenses to see category breakdown
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle className="flex items-center gap-2">
          <PieChartIcon className="h-5 w-5" />
          Category Breakdown
        </CardTitle>
        <CardDescription>
          Total: ${totalAmount.toFixed(2)}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="category"
              innerRadius={60}
              outerRadius={120}
              strokeWidth={2}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
            <ChartLegend
              content={<ChartLegendContent nameKey="category" />}
              className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
            />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default CategoryPieChart;