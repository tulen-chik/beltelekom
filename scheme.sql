-- Create users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL
  role VARCHAR(20) NOT NULL DEFAULT 'user';
);

-- Обновленная таблица calls
CREATE TABLE calls (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  call_date DATE NOT NULL,
  call_type VARCHAR(20) NOT NULL CHECK (call_type IN ('local', 'long_distance', 'international', 'wire_service')),
  service_name VARCHAR(255),
  quantity VARCHAR(20),
  code VARCHAR(10),
  minutes INTEGER,
  amount DECIMAL(10, 2) NOT NULL
);

-- Таблица billing_summary остается без изменений
CREATE TABLE billing_summary (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  month VARCHAR(20) NOT NULL,
  total_charges DECIMAL(10, 2) NOT NULL,
  previous_balance DECIMAL(10, 2) NOT NULL,
  payments_received DECIMAL(10, 2) NOT NULL,
  current_balance DECIMAL(10, 2) NOT NULL
);