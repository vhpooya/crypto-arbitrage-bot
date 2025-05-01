
-- اسکریپت SQL برای ایجاد جداول موردنیاز

-- جدول معاملات
CREATE TABLE Trades (
    id INT IDENTITY(1,1) PRIMARY KEY,
    coin VARCHAR(50) NOT NULL,
    buyExchange VARCHAR(100) NOT NULL,
    sellExchange VARCHAR(100) NOT NULL,
    buyPrice DECIMAL(18, 8) NOT NULL,
    sellPrice DECIMAL(18, 8) NOT NULL,
    amount DECIMAL(18, 8) NOT NULL,
    profit DECIMAL(18, 8) NOT NULL,
    profitPercentage DECIMAL(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL,
    timestamp DATETIME NOT NULL
);

-- جدول تنظیمات ربات
CREATE TABLE BotSettings (
    id INT PRIMARY KEY,
    settings NVARCHAR(MAX) NOT NULL,
    updated_at DATETIME NOT NULL
);

-- جدول تنظیمات صرافی‌ها
CREATE TABLE ExchangeSettings (
    id INT IDENTITY(1,1) PRIMARY KEY,
    exchange_id VARCHAR(100) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    api_key NVARCHAR(255),
    api_secret NVARCHAR(255),
    updated_at DATETIME NOT NULL
);

-- ایجاد ایندکس برای بهبود عملکرد
CREATE INDEX IX_Trades_Timestamp ON Trades(timestamp);
CREATE INDEX IX_Trades_Coin ON Trades(coin);
CREATE INDEX IX_Trades_Status ON Trades(status);
CREATE INDEX IX_ExchangeSettings_ExchangeId ON ExchangeSettings(exchange_id);
