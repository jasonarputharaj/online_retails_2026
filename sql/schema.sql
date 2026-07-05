CREATE DATABASE ecommerce_db;
USE ecommerce_db;

CREATE TABLE customers (
  customer_id INT PRIMARY KEY,
  country VARCHAR(100)
);

CREATE TABLE products (
  stock_code VARCHAR(20) PRIMARY KEY,
  description VARCHAR(255),
  price DECIMAL(10,2)
);

CREATE TABLE orders (
  invoice_no VARCHAR(20) PRIMARY KEY,
  customer_id INT,
  order_date DATETIME,
  FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  invoice_no VARCHAR(20),
  stock_code VARCHAR(20),
  quantity INT,
  FOREIGN KEY (invoice_no) REFERENCES orders(invoice_no),
  FOREIGN KEY (stock_code) REFERENCES products(stock_code)
);
