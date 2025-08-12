import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ExpenseCategory } from '../types/ExpenseCategory';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/form';
import { DatePicker } from './ui/date-picker';
import { Filter, X, CalendarDays } from 'lucide-react';
import { Badge } from './ui/badge';

// Zod schema for filter validation
const filterFormSchema = z.object({
  category: z.string().optional(),
  quickRange: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
}).refine((data) => {
  // If end date is provided, start date should also be provided
  if (data.endDate && !data.startDate) {
    return false;
  }
  // If both dates are provided, start date should be <= end date
  if (data.startDate && data.endDate && data.startDate > data.endDate) {
    return false;
  }
  return true;
}, {
  message: "Invalid date range",
  path: ["endDate"],
});

type FilterFormValues = z.infer<typeof filterFormSchema>;

interface FilterControlsProps {
  onFilter: (category?: ExpenseCategory, startDate?: string, endDate?: string) => void;
}

const FilterControls: React.FC<FilterControlsProps> = ({ onFilter }) => {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);

  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterFormSchema),
    defaultValues: {
      category: 'all',
      quickRange: 'custom',
      startDate: undefined,
      endDate: undefined,
    },
  });

  const calculateDates = (range: string) => {
    const today = new Date();
    let start: Date | undefined;
    let end = today;

    if (range === '7days') {
      start = new Date(today);
      start.setDate(today.getDate() - 7);
    } else if (range === '15days') {
      start = new Date(today);
      start.setDate(today.getDate() - 15);
    } else if (range === '1month') {
      start = new Date(today);
      start.setMonth(today.getMonth() - 1);
    }
    return { start, end };
  };

  const handleApplyFilter = (values: FilterFormValues) => {
    let finalStartDate: string | undefined;
    let finalEndDate: string | undefined;
    const filters: string[] = [];

    // Handle quick range
    if (values.quickRange) {
      const { start, end } = calculateDates(values.quickRange);
      finalStartDate = start?.toISOString().split('T')[0];
      finalEndDate = end.toISOString().split('T')[0];
      
      const rangeLabels: Record<string, string> = {
        '7days': 'Last 7 Days',
        '15days': 'Last 15 Days',
        '1month': 'Last 1 Month'
      };
      filters.push(rangeLabels[values.quickRange]);
    } else {
      // Handle custom date range
      if (values.startDate) {
        finalStartDate = values.startDate.toISOString().split('T')[0];
        filters.push(`From ${values.startDate.toLocaleDateString()}`);
      }
      if (values.endDate) {
        finalEndDate = values.endDate.toISOString().split('T')[0];
        filters.push(`To ${values.endDate.toLocaleDateString()}`);
      }
    }

    // Handle category filter
    const finalCategory = values.category === 'all' ? undefined : (values.category as ExpenseCategory);
    if (finalCategory) {
      filters.push(finalCategory.replace('_', ' '));
    }

    setActiveFilters(filters);
    onFilter(finalCategory, finalStartDate, finalEndDate);
  };

  const handleClearFilter = () => {
    form.reset({
      category: 'all',
      quickRange: 'custom',
      startDate: undefined,
      endDate: undefined,
    });
    setActiveFilters([]);
    onFilter(undefined, undefined, undefined);
  };

  // Watch for quick range changes to clear custom dates
  const quickRange = form.watch('quickRange');
  React.useEffect(() => {
    if (quickRange) {
      form.setValue('startDate', undefined);
      form.setValue('endDate', undefined);
    }
  }, [quickRange, form]);

  // Watch for custom date changes to clear quick range
  const startDate = form.watch('startDate');
  const endDate = form.watch('endDate');
  React.useEffect(() => {
    if (startDate || endDate) {
      form.setValue('quickRange', 'custom');
    }
  }, [startDate, endDate, form]);

  // Format category names for display
  const formatCategoryName = (category: string) => {
    return category
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const hasActiveFilters = activeFilters.length > 0;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            <Filter className="h-6 w-6" />
            Filter Expenses
          </CardTitle>
          {hasActiveFilters && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Active filters:</span>
              <div className="flex flex-wrap gap-1">
                {activeFilters.map((filter, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {filter}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleApplyFilter)} className="space-y-6">
            {/* First Row: Category and Quick Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Filter */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {Object.values(ExpenseCategory).map((category) => (
                          <SelectItem key={category} value={category}>
                            {formatCategoryName(category)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Quick Range Filter */}
              <FormField
                control={form.control}
                name="quickRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quick Range</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Custom" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="custom">Custom</SelectItem>
                        <SelectItem value="7days">Last 7 Days</SelectItem>
                        <SelectItem value="15days">Last 15 Days</SelectItem>
                        <SelectItem value="1month">Last 1 Month</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Second Row: Custom Date Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      Start Date
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Select start date"
                        disabled={form.watch('quickRange') !== 'custom'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* End Date */}
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4" />
                      End Date
                    </FormLabel>
                    <FormControl>
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Select end date"
                        disabled={form.watch('quickRange') !== 'custom'}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="flex-1">
                <Filter className="mr-2 h-4 w-4" />
                Apply Filter
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClearFilter}
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" />
                Clear Filter
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default FilterControls;