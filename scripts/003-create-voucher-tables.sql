-- Create payment_vouchers table
CREATE TABLE IF NOT EXISTS payment_vouchers (
  id SERIAL PRIMARY KEY,
  voucher_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  payment_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create receipt_vouchers table
CREATE TABLE IF NOT EXISTS receipt_vouchers (
  id SERIAL PRIMARY KEY,
  voucher_number VARCHAR(50) UNIQUE NOT NULL,
  customer_id INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  receipt_date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  payment_method VARCHAR(50),
  reference_number VARCHAR(100),
  description TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_customer_id ON payment_vouchers(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_vouchers_status ON payment_vouchers(status);
CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_customer_id ON receipt_vouchers(customer_id);
CREATE INDEX IF NOT EXISTS idx_receipt_vouchers_status ON receipt_vouchers(status);

