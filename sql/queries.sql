-- 1. Monthly Revenue Trend
SELECT 
    DATE_FORMAT(o.order_date, '%Y-%m') AS month,
    ROUND(SUM(oi.quantity * p.price), 2) AS total_revenue
FROM orders o
JOIN order_items oi ON o.invoice_no = oi.invoice_no
JOIN products p ON oi.stock_code = p.stock_code
GROUP BY month
ORDER BY month;

-- 2. Top 10 Products by Revenue
SELECT 
    p.stock_code,
    p.description,
    SUM(oi.quantity) AS total_units_sold,
    ROUND(SUM(oi.quantity * p.price), 2) AS total_revenue
FROM order_items oi
JOIN products p ON oi.stock_code = p.stock_code
GROUP BY p.stock_code, p.description
ORDER BY total_revenue DESC
LIMIT 10;

-- 3. RFM Customer Segmentation
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
ORDER BY monetary DESC;

-- 4. Repeat Purchase Rate
SELECT 
    COUNT(DISTINCT customer_id) AS total_customers,
    COUNT(DISTINCT CASE WHEN order_count > 1 THEN customer_id END) AS repeat_customers,
    ROUND(COUNT(DISTINCT CASE WHEN order_count > 1 THEN customer_id END) * 100.0 / COUNT(DISTINCT customer_id), 2) AS repeat_rate_pct
FROM (
    SELECT customer_id, COUNT(DISTINCT invoice_no) AS order_count
    FROM orders
    GROUP BY customer_id
) t;

-- 5. Cohort Retention
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
ORDER BY cohort_month, order_month;
