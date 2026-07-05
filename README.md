# E-Commerce Sales & Customer Insights Dashboard

A full-stack analytics project that transforms raw e-commerce transaction data into actionable business insights — built with **Python, SQL (MySQL), Node.js, and Chart.js**.

<img width="1920" height="1080" alt="Screenshot (1016)" src="https://github.com/user-attachments/assets/31e190b8-54fe-4d6c-81a0-b4abd570697d" />

## Overview

This project ingests real-world e-commerce transaction data (767K+ rows), cleans and normalizes it into a relational schema, runs analytical SQL queries (RFM segmentation, revenue trends, retention), and serves the results through a Node.js API to an interactive dashboard.

**Dataset:** [Online Retail II (UCI)](https://www.kaggle.com/datasets/mashlyn/online-retail-ii-uci) — real transaction data from a UK-based online retailer (Dec 2009 – Dec 2011).

## Tech Stack

| Layer | Technology |
|---|---|
| Data Cleaning / ETL | Python (Pandas) |
| Database | MySQL |
| Backend API | Node.js, Express |
| Frontend | HTML, CSS, Chart.js |

## Key Insights

- **767,369** cleaned transaction records loaded, across **5,860 customers**, **4,630 products**, and **36,457 orders**
- **Peak revenue month:** November 2010 (₹12,40,660.64) — clear seasonal spike ahead of the holidays
- Customer base segmented into **Champions, Loyal, Regular, At Risk, and Lost** using RFM (Recency, Frequency, Monetary) analysis with SQL window functions
- Repeat purchase rate: **_[add your %]_** — *(run `/api/customers/repeat-rate` to fill this in)*
- Identified top-spending customers, including wholesale-pattern buyers with 100+ orders

## Project Architecture

```
Kaggle CSV (raw)
      │
      ▼
Python (Pandas) — cleaning, deduplication, normalization
      │
      ▼
MySQL — 4 normalized tables (customers, products, orders, order_items)
      │
      ▼
Node.js / Express — REST API layer (5 analytical endpoints)
      │
      ▼
HTML + Chart.js — interactive dashboard
```

## Data Pipeline

### 1. Data Cleaning (Python)
- Loaded raw CSV (1,048,575 rows, 8 columns)
- Removed 34,150 duplicate rows and 236,682 rows with missing Customer IDs
- Removed 18,160 cancelled orders (invoice numbers starting with 'C') and matching negative quantities
- Removed 70 rows with zero/negative prices
- Fixed data types (`InvoiceDate` → datetime, `Customer ID` → integer)
- **Final cleaned dataset: 767,369 rows**

### 2. Normalization
Split the single flat file into 4 relational tables to eliminate data redundancy:
- `customers` (customer_id, country)
- `products` (stock_code, description, price)
- `orders` (invoice_no, customer_id, order_date)
- `order_items` (invoice_no, stock_code, quantity)

### 3. SQL Analysis
Wrote analytical queries using joins, aggregations, and window functions:
- Monthly revenue trend
- Top 10 products by revenue
- RFM customer segmentation (`NTILE()` window function)
- Repeat purchase rate
- Cohort retention analysis

### 4. API Layer (Node.js/Express)
| Endpoint | Description |
|---|---|
| `GET /api/revenue/monthly` | Monthly revenue trend |
| `GET /api/products/top` | Top 10 products by revenue |
| `GET /api/customers/rfm` | RFM scores + segment per customer |
| `GET /api/customers/repeat-rate` | Repeat purchase rate |
| `GET /api/cohort/retention` | Cohort retention by signup month |

### 5. Dashboard (Frontend)
A single-page dashboard consuming the above endpoints, rendering:
- Stat cards (total customers, repeat customers, repeat rate)
- Revenue trend line chart
- Top products bar chart
- RFM segment doughnut chart
- Customer detail table with segment badges

## Screenshots

| Revenue Trend | Customer Segments |
|---|---|
| <img width="1920" height="1080" alt="Screenshot (1018)" src="https://github.com/user-attachments/assets/1f9c3841-6b82-4c95-816c-f8a200ce4adc" />
 | <img width="1920" height="1080" alt="Screenshot (1017)" src="https://github.com/user-attachments/assets/366ddbc9-191e-4258-a520-7b55664192a6" />
 |

## How to Run Locally

**Prerequisites:** Python 3, MySQL, Node.js

```bash
# 1. Clone the repo
git clone https://github.com/jasonarputharaj/ecommerce-insights.git
cd ecommerce-insights

# 2. Set up the database
mysql -u root -p < sql/schema.sql

# 3. Run the ETL script (cleans data + loads into MySQL)
cd etl
pip install pandas mysql-connector-python
python clean_and_load.py

# 4. Start the backend API
cd ../server
npm install
# create a .env file with your DB credentials (see .env.example)
node index.js

# 5. Open the dashboard
# open client/index.html in your browser
```

## Project Structure

```
ecommerce-insights/
├── data/
│   ├── raw/                  # original Kaggle dataset
│   └── processed/            # cleaned + normalized CSVs
├── etl/
│   └── clean_and_load.py     # Python cleaning + MySQL load script
├── sql/
│   ├── schema.sql            # table definitions
│   └── queries.sql           # analysis queries
├── server/
│   └── index.js              # Express API
├── client/
│   └── index.html            # dashboard frontend
├── screenshots/
└── README.md
```

## Author

**Jason Arputharaj**
Final-year ECE student, Karunya Institute of Technology and Sciences
[GitHub](https://github.com/jasonarputharaj) · [LinkedIn](https://linkedin.com/in/jason-arputharaj)
