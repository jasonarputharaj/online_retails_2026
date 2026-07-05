import pandas as pd
df = pd.read_csv(r"C:\data\Raw\online_retail_II.csv")
print(df.shape)
print(df.head())
print(df.info())
print(df.duplicated().sum())
print(df['Customer ID'].isnull().sum())
# Remove exact duplicate rows
df = df.drop_duplicates()

# Drop rows with missing Customer ID (can't attribute to a customer for RFM analysis)
df = df.dropna(subset=['Customer ID'])

print(df.shape)

# Invoices starting with 'C' are cancellations/returns
print(df[df['Invoice'].astype(str).str.startswith('C')].shape)

# Negative quantities
print(df[df['Quantity'] < 0].shape)

# Zero or negative prices
print(df[df['Price'] <= 0].shape)

# Remove cancelled orders (Invoice starting with 'C')
df = df[~df['Invoice'].astype(str).str.startswith('C')]

# Remove negative quantities
df = df[df['Quantity'] > 0]

# Remove zero/negative prices
df = df[df['Price'] > 0]

print(df.shape)

# Fix InvoiceDate to proper datetime
df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'], format='%d-%m-%Y %H:%M')

# Fix Customer ID to integer (it's float64 now because of earlier NaNs)
df['Customer ID'] = df['Customer ID'].astype(int)

print(df.dtypes)

df.to_csv(r"C:\data\processed\cleaned_online_retail.csv", index=False)
print("Saved cleaned file")
# customers table
customers = df[['Customer ID', 'Country']].drop_duplicates(subset=['Customer ID'])
customers.to_csv(r"C:\data\processed\customers.csv", index=False)

# products table
products = df[['StockCode', 'Description', 'Price']].drop_duplicates(subset=['StockCode'])
products.to_csv(r"C:\data\processed\products.csv", index=False)

# orders table
orders = df[['Invoice', 'Customer ID', 'InvoiceDate']].drop_duplicates(subset=['Invoice'])
orders.to_csv(r"C:\data\processed\orders.csv", index=False)

# order_items table
order_items = df[['Invoice', 'StockCode', 'Quantity']]
order_items.to_csv(r"C:\data\processed\order_items.csv", index=False)

print("All 4 tables saved")