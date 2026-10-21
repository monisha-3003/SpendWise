-- SpendWise DEMO DATA (optional)
-- All rows are flagged is_demo = 1 so the app can label them and you can remove them with:
--   DELETE FROM expenses WHERE is_demo = 1;
-- Dates are relative to the day you import this file, so the dashboard looks current.
USE spendwise;

INSERT INTO expenses (amount, category, description, expense_date, is_demo) VALUES
-- This month
(250.00,  'Food',      'Lunch at campus canteen',        CURDATE(), 1),
(1200.00, 'Shopping',  'T-shirts (demo)',                DATE_SUB(CURDATE(), INTERVAL 1 DAY), 1),
(180.50,  'Travel',    'Auto rickshaw fares',            DATE_SUB(CURDATE(), INTERVAL 2 DAY), 1),
(799.00,  'Bills',     'Mobile recharge',                DATE_SUB(CURDATE(), INTERVAL 3 DAY), 1),
(450.00,  'Food',      'Dinner with friends',            DATE_SUB(CURDATE(), INTERVAL 4 DAY), 1),
(650.00,  'Education', 'Online course subscription',     DATE_SUB(CURDATE(), INTERVAL 5 DAY), 1),
(320.00,  'Health',    'Pharmacy',                       DATE_SUB(CURDATE(), INTERVAL 6 DAY), 1),
(150.00,  'Others',    'Stationery',                     DATE_SUB(CURDATE(), INTERVAL 7 DAY), 1),
-- Last month
(2100.00, 'Food',      'Groceries and snacks',           DATE_SUB(CURDATE(), INTERVAL 1 MONTH), 1),
(1800.00, 'Travel',    'Train tickets home',             DATE_SUB(CURDATE(), INTERVAL 1 MONTH), 1),
(999.00,  'Bills',     'Internet bill',                  DATE_SUB(CURDATE(), INTERVAL 1 MONTH), 1),
(1500.00, 'Shopping',  'Shoes',                          DATE_SUB(CURDATE(), INTERVAL 1 MONTH), 1),
-- Two months ago
(1900.00, 'Food',      'Groceries and snacks',           DATE_SUB(CURDATE(), INTERVAL 2 MONTH), 1),
(700.00,  'Education', 'Books',                          DATE_SUB(CURDATE(), INTERVAL 2 MONTH), 1),
(999.00,  'Bills',     'Internet bill',                  DATE_SUB(CURDATE(), INTERVAL 2 MONTH), 1),
(600.00,  'Health',    'Doctor consultation',            DATE_SUB(CURDATE(), INTERVAL 2 MONTH), 1),
-- Three months ago
(2300.00, 'Food',      'Groceries and snacks',           DATE_SUB(CURDATE(), INTERVAL 3 MONTH), 1),
(2500.00, 'Travel',    'Weekend trip',                   DATE_SUB(CURDATE(), INTERVAL 3 MONTH), 1),
(999.00,  'Bills',     'Internet bill',                  DATE_SUB(CURDATE(), INTERVAL 3 MONTH), 1);

INSERT INTO budgets (category, month, amount) VALUES
('TOTAL',     DATE_FORMAT(CURDATE(), '%Y-%m'), 10000.00),
('Food',      DATE_FORMAT(CURDATE(), '%Y-%m'), 2500.00),
('Travel',    DATE_FORMAT(CURDATE(), '%Y-%m'), 1500.00),
('Shopping',  DATE_FORMAT(CURDATE(), '%Y-%m'), 1300.00),
('Education', DATE_FORMAT(CURDATE(), '%Y-%m'), 1000.00),
('Bills',     DATE_FORMAT(CURDATE(), '%Y-%m'), 1000.00),
('Health',    DATE_FORMAT(CURDATE(), '%Y-%m'), 500.00)
ON DUPLICATE KEY UPDATE amount = VALUES(amount);
