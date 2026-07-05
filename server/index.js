require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
});

app.get('/api/revenue/monthly', (req, res) => {
    const query = `
        SELECT 
            DATE_FORMAT(o.order_date, '%Y-%m') AS month,
            ROUND(SUM(oi.quantity * p.price), 2) AS total_revenue
        FROM orders o
        JOIN order_items oi ON o.invoice_no = oi.invoice_no
        JOIN products p ON oi.stock_code = p.stock_code
        GROUP BY month
        ORDER BY month
    `;
    db.query(query, (err, results) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(results);
    });
});

app.get('/api/products/top', (req, res) => {
    const query = `
        SELECT 
            p.stock_code,
            p.description,
            SUM(oi.quantity) AS total_units_sold,
            ROUND(SUM(oi.quantity * p.price), 2) AS total_revenue
        FROM order_items oi
        JOIN products p ON oi.stock_code = p.stock_code
        GROUP BY p.stock_code, p.description
        ORDER BY total_revenue DESC
        LIMIT 10
    `;
    db.query(query, (err, results) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(results);
    });
});

app.get('/api/customers/rfm', (req, res) => {
    const query = `
        WITH rfm AS (
            SELECT 
                o.customer_id,
                DATEDIFF((SELECT MAX(order_date) FROM orders), MAX(o.order_date)) AS recency_days,
                COUNT(DISTINCT o.invoice_no) AS frequency,
                ROUND(SUM(oi.quantity * p.price), 2) AS monetary
            FROM orders o
            JOIN order_items oi ON o.invoice_no = oi.invoice_no
            JOIN products p ON oi.stock_code = p.stock_code
            GROUP BY o.customer_id
        ),
        scored AS (
            SELECT 
                customer_id, recency_days, frequency, monetary,
                NTILE(5) OVER (ORDER BY recency_days ASC) AS r_score,
                NTILE(5) OVER (ORDER BY frequency DESC) AS f_score,
                NTILE(5) OVER (ORDER BY monetary DESC) AS m_score
            FROM rfm
        )
        SELECT 
            customer_id, recency_days, frequency, monetary,
            r_score, f_score, m_score,
            CASE 
                WHEN r_score <= 2 AND f_score <= 2 AND m_score <= 2 THEN 'Champions'
                WHEN r_score <= 2 AND f_score <= 3 THEN 'Loyal Customers'
                WHEN r_score >= 4 AND f_score >= 4 THEN 'At Risk'
                WHEN r_score = 5 THEN 'Lost'
                ELSE 'Regular'
            END AS segment
        FROM scored
        ORDER BY monetary DESC
    `;
    db.query(query, (err, results) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(results);
    });
});

app.get('/api/customers/repeat-rate', (req, res) => {
    const query = `
        SELECT 
            COUNT(DISTINCT customer_id) AS total_customers,
            COUNT(DISTINCT CASE WHEN order_count > 1 THEN customer_id END) AS repeat_customers,
            ROUND(COUNT(DISTINCT CASE WHEN order_count > 1 THEN customer_id END) * 100.0 / COUNT(DISTINCT customer_id), 2) AS repeat_rate_pct
        FROM (
            SELECT customer_id, COUNT(DISTINCT invoice_no) AS order_count
            FROM orders
            GROUP BY customer_id
        ) t
    `;
    db.query(query, (err, results) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(results[0]);
    });
});

app.get('/api/cohort/retention', (req, res) => {
    const query = `
        WITH first_purchase AS (
            SELECT customer_id, DATE_FORMAT(MIN(order_date), '%Y-%m') AS cohort_month
            FROM orders
            GROUP BY customer_id
        ),
        customer_orders AS (
            SELECT 
                o.customer_id,
                fp.cohort_month,
                DATE_FORMAT(o.order_date, '%Y-%m') AS order_month
            FROM orders o
            JOIN first_purchase fp ON o.customer_id = fp.customer_id
        )
        SELECT 
            cohort_month, order_month,
            COUNT(DISTINCT customer_id) AS active_customers
        FROM customer_orders
        GROUP BY cohort_month, order_month
        ORDER BY cohort_month, order_month
    `;
    db.query(query, (err, results) => {
        if (err) { res.status(500).json({ error: err.message }); return; }
        res.json(results);
    });
});

app.listen(process.env.PORT, () => {
    console.log(`Server running on port ${process.env.PORT}`);
});
