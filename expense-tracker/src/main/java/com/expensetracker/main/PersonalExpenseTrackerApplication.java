package com.expensetracker.main;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication(scanBasePackages = "com.expensetracker")
public class PersonalExpenseTrackerApplication {

    public static void main(String[] args) {
        SpringApplication.run(PersonalExpenseTrackerApplication.class, args);
    }

}
