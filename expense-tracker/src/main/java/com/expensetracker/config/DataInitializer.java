package com.expensetracker.config;

import com.expensetracker.model.Expense;
import com.expensetracker.model.ExpenseCategory;
import com.expensetracker.repository.ExpenseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(ExpenseRepository repository) {
        return args -> {
            // Skip data initialization - data will be created by authenticated users through OAuth2
            // This prevents user_id constraint violations since we don't have users during startup
            if (false) {
                System.out.println("Initializing database with sample data...");

                // June 2025 Expenses
                repository.save(new Expense(new BigDecimal("15.50"), ExpenseCategory.FOOD, "Breakfast at cafe", LocalDate.of(2025, 6, 1)));
                repository.save(new Expense(new BigDecimal("45.20"), ExpenseCategory.FOOD, "Grocery shopping - weekly", LocalDate.of(2025, 6, 2)));
                repository.save(new Expense(new BigDecimal("12.80"), ExpenseCategory.FOOD, "Coffee and pastry", LocalDate.of(2025, 6, 3)));
                repository.save(new Expense(new BigDecimal("35.00"), ExpenseCategory.FOOD, "Lunch with colleagues", LocalDate.of(2025, 6, 5)));
                repository.save(new Expense(new BigDecimal("28.90"), ExpenseCategory.FOOD, "Dinner at Italian restaurant", LocalDate.of(2025, 6, 7)));
                repository.save(new Expense(new BigDecimal("8.50"), ExpenseCategory.FOOD, "Ice cream", LocalDate.of(2025, 6, 8)));
                repository.save(new Expense(new BigDecimal("52.30"), ExpenseCategory.FOOD, "Weekend grocery shopping", LocalDate.of(2025, 6, 9)));
                repository.save(new Expense(new BigDecimal("18.75"), ExpenseCategory.FOOD, "Pizza delivery", LocalDate.of(2025, 6, 12)));
                repository.save(new Expense(new BigDecimal("6.20"), ExpenseCategory.FOOD, "Morning coffee", LocalDate.of(2025, 6, 14)));
                repository.save(new Expense(new BigDecimal("42.60"), ExpenseCategory.FOOD, "Family dinner out", LocalDate.of(2025, 6, 16)));
                repository.save(new Expense(new BigDecimal("25.40"), ExpenseCategory.FOOD, "Lunch meeting", LocalDate.of(2025, 6, 18)));
                repository.save(new Expense(new BigDecimal("38.90"), ExpenseCategory.FOOD, "Grocery shopping", LocalDate.of(2025, 6, 20)));
                repository.save(new Expense(new BigDecimal("14.30"), ExpenseCategory.FOOD, "Breakfast sandwich", LocalDate.of(2025, 6, 22)));
                repository.save(new Expense(new BigDecimal("31.80"), ExpenseCategory.FOOD, "Dinner with friends", LocalDate.of(2025, 6, 24)));
                repository.save(new Expense(new BigDecimal("48.70"), ExpenseCategory.FOOD, "Weekly groceries", LocalDate.of(2025, 6, 27)));
                repository.save(new Expense(new BigDecimal("22.15"), ExpenseCategory.FOOD, "Takeout Chinese", LocalDate.of(2025, 6, 29)));

                repository.save(new Expense(new BigDecimal("50.00"), ExpenseCategory.TRANSPORTATION, "Gas fill-up", LocalDate.of(2025, 6, 1)));
                repository.save(new Expense(new BigDecimal("12.50"), ExpenseCategory.TRANSPORTATION, "Bus fare - weekly pass", LocalDate.of(2025, 6, 3)));
                repository.save(new Expense(new BigDecimal("25.30"), ExpenseCategory.TRANSPORTATION, "Uber to airport", LocalDate.of(2025, 6, 5)));
                repository.save(new Expense(new BigDecimal("45.00"), ExpenseCategory.TRANSPORTATION, "Gas station", LocalDate.of(2025, 6, 8)));
                repository.save(new Expense(new BigDecimal("8.75"), ExpenseCategory.TRANSPORTATION, "Parking fee downtown", LocalDate.of(2025, 6, 10)));
                repository.save(new Expense(new BigDecimal("32.40"), ExpenseCategory.TRANSPORTATION, "Taxi ride", LocalDate.of(2025, 6, 12)));
                repository.save(new Expense(new BigDecimal("55.80"), ExpenseCategory.TRANSPORTATION, "Full tank gas", LocalDate.of(2025, 6, 15)));
                repository.save(new Expense(new BigDecimal("15.20"), ExpenseCategory.TRANSPORTATION, "Metro card refill", LocalDate.of(2025, 6, 18)));
                repository.save(new Expense(new BigDecimal("28.90"), ExpenseCategory.TRANSPORTATION, "Ride share to meeting", LocalDate.of(2025, 6, 20)));
                repository.save(new Expense(new BigDecimal("42.30"), ExpenseCategory.TRANSPORTATION, "Gas and car wash", LocalDate.of(2025, 6, 23)));
                repository.save(new Expense(new BigDecimal("18.60"), ExpenseCategory.TRANSPORTATION, "Airport parking", LocalDate.of(2025, 6, 25)));
                repository.save(new Expense(new BigDecimal("38.70"), ExpenseCategory.TRANSPORTATION, "Gas station", LocalDate.of(2025, 6, 28)));

                repository.save(new Expense(new BigDecimal("45.00"), ExpenseCategory.ENTERTAINMENT, "Movie tickets for two", LocalDate.of(2025, 6, 2)));
                repository.save(new Expense(new BigDecimal("12.99"), ExpenseCategory.ENTERTAINMENT, "Netflix subscription", LocalDate.of(2025, 6, 5)));
                repository.save(new Expense(new BigDecimal("25.50"), ExpenseCategory.ENTERTAINMENT, "Concert tickets", LocalDate.of(2025, 6, 8)));
                repository.save(new Expense(new BigDecimal("35.80"), ExpenseCategory.ENTERTAINMENT, "Mini golf and arcade", LocalDate.of(2025, 6, 11)));
                repository.save(new Expense(new BigDecimal("18.75"), ExpenseCategory.ENTERTAINMENT, "Book purchase", LocalDate.of(2025, 6, 13)));
                repository.save(new Expense(new BigDecimal("52.40"), ExpenseCategory.ENTERTAINMENT, "Theatre show", LocalDate.of(2025, 6, 16)));
                repository.save(new Expense(new BigDecimal("8.99"), ExpenseCategory.ENTERTAINMENT, "Game app purchase", LocalDate.of(2025, 6, 18)));
                repository.save(new Expense(new BigDecimal("28.60"), ExpenseCategory.ENTERTAINMENT, "Bowling night", LocalDate.of(2025, 6, 21)));
                repository.save(new Expense(new BigDecimal("42.30"), ExpenseCategory.ENTERTAINMENT, "Amusement park", LocalDate.of(2025, 6, 24)));
                repository.save(new Expense(new BigDecimal("15.99"), ExpenseCategory.ENTERTAINMENT, "Spotify premium", LocalDate.of(2025, 6, 26)));
                repository.save(new Expense(new BigDecimal("38.90"), ExpenseCategory.ENTERTAINMENT, "Comedy show", LocalDate.of(2025, 6, 29)));

                repository.save(new Expense(new BigDecimal("85.00"), ExpenseCategory.HEALTHCARE, "Doctor consultation", LocalDate.of(2025, 6, 3)));
                repository.save(new Expense(new BigDecimal("24.50"), ExpenseCategory.HEALTHCARE, "Pharmacy - medications", LocalDate.of(2025, 6, 5)));
                repository.save(new Expense(new BigDecimal("45.30"), ExpenseCategory.HEALTHCARE, "Dental cleaning", LocalDate.of(2025, 6, 10)));
                repository.save(new Expense(new BigDecimal("18.90"), ExpenseCategory.HEALTHCARE, "Vitamin supplements", LocalDate.of(2025, 6, 12)));
                repository.save(new Expense(new BigDecimal("120.00"), ExpenseCategory.HEALTHCARE, "Eye exam and glasses", LocalDate.of(2025, 6, 15)));
                repository.save(new Expense(new BigDecimal("32.75"), ExpenseCategory.HEALTHCARE, "Prescription refill", LocalDate.of(2025, 6, 18)));
                repository.save(new Expense(new BigDecimal("65.40"), ExpenseCategory.HEALTHCARE, "Physical therapy session", LocalDate.of(2025, 6, 22)));
                repository.save(new Expense(new BigDecimal("28.60"), ExpenseCategory.HEALTHCARE, "First aid supplies", LocalDate.of(2025, 6, 25)));
                repository.save(new Expense(new BigDecimal("42.80"), ExpenseCategory.HEALTHCARE, "Lab tests", LocalDate.of(2025, 6, 28)));

                repository.save(new Expense(new BigDecimal("89.99"), ExpenseCategory.SHOPPING, "New running shoes", LocalDate.of(2025, 6, 2)));
                repository.save(new Expense(new BigDecimal("35.40"), ExpenseCategory.SHOPPING, "T-shirts and socks", LocalDate.of(2025, 6, 6)));
                repository.save(new Expense(new BigDecimal("125.80"), ExpenseCategory.SHOPPING, "Electronics - phone charger", LocalDate.of(2025, 6, 9)));
                repository.save(new Expense(new BigDecimal("48.60"), ExpenseCategory.SHOPPING, "Home decor items", LocalDate.of(2025, 6, 12)));
                repository.save(new Expense(new BigDecimal("72.30"), ExpenseCategory.SHOPPING, "Work clothes", LocalDate.of(2025, 6, 15)));
                repository.save(new Expense(new BigDecimal("28.90"), ExpenseCategory.SHOPPING, "Kitchen utensils", LocalDate.of(2025, 6, 18)));
                repository.save(new Expense(new BigDecimal("95.50"), ExpenseCategory.SHOPPING, "Weekend shopping spree", LocalDate.of(2025, 6, 21)));
                repository.save(new Expense(new BigDecimal("42.75"), ExpenseCategory.SHOPPING, "Gift for friend", LocalDate.of(2025, 6, 24)));
                repository.save(new Expense(new BigDecimal("38.20"), ExpenseCategory.SHOPPING, "Household supplies", LocalDate.of(2025, 6, 27)));

                repository.save(new Expense(new BigDecimal("120.00"), ExpenseCategory.BILLS, "Electricity bill", LocalDate.of(2025, 6, 1)));
                repository.save(new Expense(new BigDecimal("85.50"), ExpenseCategory.BILLS, "Internet and cable", LocalDate.of(2025, 6, 5)));
                repository.save(new Expense(new BigDecimal("65.30"), ExpenseCategory.BILLS, "Mobile phone bill", LocalDate.of(2025, 6, 8)));
                repository.save(new Expense(new BigDecimal("95.80"), ExpenseCategory.BILLS, "Water and sewage", LocalDate.of(2025, 6, 12)));
                repository.save(new Expense(new BigDecimal("450.00"), ExpenseCategory.BILLS, "Monthly rent", LocalDate.of(2025, 6, 15)));
                repository.save(new Expense(new BigDecimal("45.90"), ExpenseCategory.BILLS, "Gas utility", LocalDate.of(2025, 6, 18)));
                repository.save(new Expense(new BigDecimal("125.40"), ExpenseCategory.BILLS, "Insurance premium", LocalDate.of(2025, 6, 22)));
                repository.save(new Expense(new BigDecimal("35.60"), ExpenseCategory.BILLS, "Streaming services", LocalDate.of(2025, 6, 25)));

                // July 2025 Expenses
                repository.save(new Expense(new BigDecimal("18.00"), ExpenseCategory.FOOD, "Breakfast at new cafe", LocalDate.of(2025, 7, 1)));
                repository.save(new Expense(new BigDecimal("50.00"), ExpenseCategory.FOOD, "Large grocery haul", LocalDate.of(2025, 7, 3)));
                repository.save(new Expense(new BigDecimal("10.50"), ExpenseCategory.FOOD, "Smoothie", LocalDate.of(2025, 7, 4)));
                repository.save(new Expense(new BigDecimal("30.00"), ExpenseCategory.FOOD, "Dinner with family", LocalDate.of(2025, 7, 6)));
                repository.save(new Expense(new BigDecimal("22.00"), ExpenseCategory.FOOD, "Fast food", LocalDate.of(2025, 7, 9)));
                repository.save(new Expense(new BigDecimal("7.00"), ExpenseCategory.FOOD, "Snacks", LocalDate.of(2025, 7, 11)));
                repository.save(new Expense(new BigDecimal("60.00"), ExpenseCategory.FOOD, "Restaurant dinner", LocalDate.of(2025, 7, 13)));
                repository.save(new Expense(new BigDecimal("20.00"), ExpenseCategory.FOOD, "Bakery items", LocalDate.of(2025, 7, 15)));
                repository.save(new Expense(new BigDecimal("15.00"), ExpenseCategory.FOOD, "Coffee and cake", LocalDate.of(2025, 7, 17)));
                repository.save(new Expense(new BigDecimal("40.00"), ExpenseCategory.FOOD, "Weekly meal prep ingredients", LocalDate.of(2025, 7, 20)));
                repository.save(new Expense(new BigDecimal("28.00"), ExpenseCategory.FOOD, "Brunch", LocalDate.of(2025, 7, 22)));
                repository.save(new Expense(new BigDecimal("33.00"), ExpenseCategory.FOOD, "Dinner party supplies", LocalDate.of(2025, 7, 25)));
                repository.save(new Expense(new BigDecimal("11.00"), ExpenseCategory.FOOD, "Late night snack", LocalDate.of(2025, 7, 28)));
                repository.save(new Expense(new BigDecimal("47.00"), ExpenseCategory.FOOD, "Last minute groceries", LocalDate.of(2025, 7, 30)));

                repository.save(new Expense(new BigDecimal("55.00"), ExpenseCategory.TRANSPORTATION, "Gas for road trip", LocalDate.of(2025, 7, 2)));
                repository.save(new Expense(new BigDecimal("10.00"), ExpenseCategory.TRANSPORTATION, "Public transport daily pass", LocalDate.of(2025, 7, 4)));
                repository.save(new Expense(new BigDecimal("30.00"), ExpenseCategory.TRANSPORTATION, "Parking at event", LocalDate.of(2025, 7, 7)));
                repository.save(new Expense(new BigDecimal("40.00"), ExpenseCategory.TRANSPORTATION, "Car wash and vacuum", LocalDate.of(2025, 7, 10)));
                repository.save(new Expense(new BigDecimal("15.00"), ExpenseCategory.TRANSPORTATION, "Toll fees", LocalDate.of(2025, 7, 12)));
                repository.save(new Expense(new BigDecimal("28.00"), ExpenseCategory.TRANSPORTATION, "Train ticket", LocalDate.of(2025, 7, 16)));
                repository.save(new Expense(new BigDecimal("60.00"), ExpenseCategory.TRANSPORTATION, "Gas fill-up", LocalDate.of(2025, 7, 19)));
                repository.save(new Expense(new BigDecimal("20.00"), ExpenseCategory.TRANSPORTATION, "Taxi to station", LocalDate.of(2025, 7, 21)));
                repository.save(new Expense(new BigDecimal("35.00"), ExpenseCategory.TRANSPORTATION, "Bus tickets for trip", LocalDate.of(2025, 7, 24)));
                repository.save(new Expense(new BigDecimal("48.00"), ExpenseCategory.TRANSPORTATION, "Gas and snacks", LocalDate.of(2025, 7, 27)));
                repository.save(new Expense(new BigDecimal("12.00"), ExpenseCategory.TRANSPORTATION, "Parking meter", LocalDate.of(2025, 7, 29)));

                repository.save(new Expense(new BigDecimal("50.00"), ExpenseCategory.ENTERTAINMENT, "Theme park tickets", LocalDate.of(2025, 7, 1)));
                repository.save(new Expense(new BigDecimal("15.00"), ExpenseCategory.ENTERTAINMENT, "Online game subscription", LocalDate.of(2025, 7, 5)));
                repository.save(new Expense(new BigDecimal("30.00"), ExpenseCategory.ENTERTAINMENT, "Museum entry", LocalDate.of(2025, 7, 8)));
                repository.save(new Expense(new BigDecimal("40.00"), ExpenseCategory.ENTERTAINMENT, "Concert merchandise", LocalDate.of(2025, 7, 11)));
                repository.save(new Expense(new BigDecimal("20.00"), ExpenseCategory.ENTERTAINMENT, "Movie rental", LocalDate.of(2025, 7, 14)));
                repository.save(new Expense(new BigDecimal("65.00"), ExpenseCategory.ENTERTAINMENT, "Live show tickets", LocalDate.of(2025, 7, 17)));
                repository.save(new Expense(new BigDecimal("10.00"), ExpenseCategory.ENTERTAINMENT, "Magazine subscription", LocalDate.of(2025, 7, 20)));
                repository.save(new Expense(new BigDecimal("35.00"), ExpenseCategory.ENTERTAINMENT, "Escape room", LocalDate.of(2025, 7, 23)));
                repository.save(new Expense(new BigDecimal("48.00"), ExpenseCategory.ENTERTAINMENT, "Art class", LocalDate.of(2025, 7, 26)));
                repository.save(new Expense(new BigDecimal("18.00"), ExpenseCategory.ENTERTAINMENT, "E-book purchase", LocalDate.of(2025, 7, 29)));

                repository.save(new Expense(new BigDecimal("90.00"), ExpenseCategory.HEALTHCARE, "Specialist consultation", LocalDate.of(2025, 7, 2)));
                repository.save(new Expense(new BigDecimal("28.00"), ExpenseCategory.HEALTHCARE, "Over-the-counter medicine", LocalDate.of(2025, 7, 6)));
                repository.save(new Expense(new BigDecimal("50.00"), ExpenseCategory.HEALTHCARE, "Physiotherapy session", LocalDate.of(2025, 7, 9)));
                repository.save(new Expense(new BigDecimal("20.00"), ExpenseCategory.HEALTHCARE, "Bandages and antiseptic", LocalDate.of(2025, 7, 13)));
                repository.save(new Expense(new BigDecimal("130.00"), ExpenseCategory.HEALTHCARE, "Annual health check-up", LocalDate.of(2025, 7, 16)));
                repository.save(new Expense(new BigDecimal("38.00"), ExpenseCategory.HEALTHCARE, "Dental floss and toothpaste", LocalDate.of(2025, 7, 19)));
                repository.save(new Expense(new BigDecimal("70.00"), ExpenseCategory.HEALTHCARE, "Massage therapy", LocalDate.of(2025, 7, 23)));
                repository.save(new Expense(new BigDecimal("30.00"), ExpenseCategory.HEALTHCARE, "Sunscreen and lotion", LocalDate.of(2025, 7, 27)));
                repository.save(new Expense(new BigDecimal("48.00"), ExpenseCategory.HEALTHCARE, "Vaccination", LocalDate.of(2025, 7, 30)));

                repository.save(new Expense(new BigDecimal("95.00"), ExpenseCategory.SHOPPING, "New pair of jeans", LocalDate.of(2025, 7, 1)));
                repository.save(new Expense(new BigDecimal("40.00"), ExpenseCategory.SHOPPING, "Desk organizer", LocalDate.of(2025, 7, 4)));
                repository.save(new Expense(new BigDecimal("130.00"), ExpenseCategory.SHOPPING, "New headphones", LocalDate.of(2025, 7, 7)));
                repository.save(new Expense(new BigDecimal("50.00"), ExpenseCategory.SHOPPING, "Books for vacation", LocalDate.of(2025, 7, 10)));
                repository.save(new Expense(new BigDecimal("78.00"), ExpenseCategory.SHOPPING, "Blender", LocalDate.of(2025, 7, 14)));
                repository.save(new Expense(new BigDecimal("30.00"), ExpenseCategory.SHOPPING, "Cleaning supplies", LocalDate.of(2025, 7, 17)));
                repository.save(new Expense(new BigDecimal("100.00"), ExpenseCategory.SHOPPING, "New backpack", LocalDate.of(2025, 7, 20)));
                repository.save(new Expense(new BigDecimal("45.00"), ExpenseCategory.SHOPPING, "Birthday gift", LocalDate.of(2025, 7, 23)));
                repository.save(new Expense(new BigDecimal("40.00"), ExpenseCategory.SHOPPING, "Pet food and toys", LocalDate.of(2025, 7, 26)));

                repository.save(new Expense(new BigDecimal("130.00"), ExpenseCategory.BILLS, "Rent payment", LocalDate.of(2025, 7, 1)));
                repository.save(new Expense(new BigDecimal("90.00"), ExpenseCategory.BILLS, "Internet bill", LocalDate.of(2025, 7, 4)));
                repository.save(new Expense(new BigDecimal("70.00"), ExpenseCategory.BILLS, "Electricity bill", LocalDate.of(2025, 7, 7)));
                repository.save(new Expense(new BigDecimal("100.00"), ExpenseCategory.BILLS, "Water bill", LocalDate.of(2025, 7, 11)));
                repository.save(new Expense(new BigDecimal("500.00"), ExpenseCategory.BILLS, "Mortgage payment", LocalDate.of(2025, 7, 15)));
                repository.save(new Expense(new BigDecimal("50.00"), ExpenseCategory.BILLS, "Phone bill", LocalDate.of(2025, 7, 18)));
                repository.save(new Expense(new BigDecimal("130.00"), ExpenseCategory.BILLS, "Car insurance", LocalDate.of(2025, 7, 21)));
                repository.save(new Expense(new BigDecimal("40.00"), ExpenseCategory.BILLS, "Gym membership", LocalDate.of(2025, 7, 24)));
                repository.save(new Expense(new BigDecimal("150.00"), ExpenseCategory.BILLS, "Credit card bill", LocalDate.of(2025, 7, 28)));

                System.out.println("Database initialized with sample data.");
            }
        };
    }
}
