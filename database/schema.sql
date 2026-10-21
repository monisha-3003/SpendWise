-- SpendWise database schema (MySQL 8+)
CREATE DATABASE IF NOT EXISTS spendwise CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE spendwise;

-- Recurring expense templates. Each row describes an expense that repeats.
CREATE TABLE IF NOT EXISTS recurring_expenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(30) NOT NULL,
  description VARCHAR(255) NOT NULL,
  frequency ENUM('weekly','monthly') NOT NULL,
  start_date DATE NOT NULL,
  last_generated_date DATE NULL,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_recurring_active (is_active)
) ENGINE=InnoDB;

-- Individual expenses. Rows created by a recurring template point back to it.
CREATE TABLE IF NOT EXISTS expenses (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  amount DECIMAL(12,2) NOT NULL,
  category VARCHAR(30) NOT NULL,
  description VARCHAR(255) NOT NULL,
  expense_date DATE NOT NULL,
  recurring_id INT UNSIGNED NULL,
  is_demo TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_expense_date (expense_date),
  INDEX idx_expense_category (category),
  CONSTRAINT fk_expense_recurring FOREIGN KEY (recurring_id)
    REFERENCES recurring_expenses(id) ON DELETE SET NULL,
  -- Prevents generating the same recurring expense twice for the same date
  CONSTRAINT uq_recurring_date UNIQUE (recurring_id, expense_date)
) ENGINE=InnoDB;

-- Budgets per month. category = 'TOTAL' holds the overall monthly budget.
CREATE TABLE IF NOT EXISTS budgets (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  category VARCHAR(30) NOT NULL,
  month CHAR(7) NOT NULL,            -- format YYYY-MM
  amount DECIMAL(12,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_budget_cat_month (category, month)
) ENGINE=InnoDB;
