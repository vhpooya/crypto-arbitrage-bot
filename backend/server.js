
// ایجاد سرور اکسپرس برای ارتباط با دیتابیس SQL Server
const express = require('express');
const cors = require('cors');
const sql = require('mssql');
const dotenv = require('dotenv');

// بارگذاری متغیرهای محیطی
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// کانفیگ برای اتصال به SQL Server
const config = {
    user: process.env.SQL_USER || 'pmv',
    password: process.env.SQL_PASSWORD || 'P@yam',
    server: process.env.SQL_SERVER || '192.168.10.224',
    database: process.env.SQL_DATABASE || 'ArbitRobatDb',
    options: {
        encrypt: true, // برای اتصال به Azure
        trustServerCertificate: true // Trust the server certificate
    }
};
// میدلویرها
app.use(cors());
app.use(express.json());

// اتصال به دیتابیس
async function connectToDatabase() {
  try {
    await sql.connect(config);
    console.log('اتصال به SQL Server با موفقیت برقرار شد.');
  } catch (err) {
    console.error('خطا در اتصال به SQL Server:', err);
  }
}

// مسیرها (API Endpoints)

// دریافت تاریخچه معاملات
app.get('/api/trades', async (req, res) => {
  try {
    const result = await sql.query`SELECT * FROM Trades ORDER BY timestamp DESC`;
    res.json(result.recordset);
  } catch (err) {
    console.error('خطا در دریافت معاملات:', err);
    res.status(500).json({ error: 'خطا در دریافت معاملات' });
  }
});

// ذخیره معامله جدید
app.post('/api/trades', async (req, res) => {
  try {
    const { coin, buyExchange, sellExchange, buyPrice, sellPrice, amount, profit, profitPercentage, status } = req.body;
    
    const result = await sql.query`
      INSERT INTO Trades (coin, buyExchange, sellExchange, buyPrice, sellPrice, amount, profit, profitPercentage, status, timestamp)
      VALUES (${coin}, ${buyExchange}, ${sellExchange}, ${buyPrice}, ${sellPrice}, ${amount}, ${profit}, ${profitPercentage}, ${status}, GETDATE())
      
      SELECT SCOPE_IDENTITY() AS id
    `;
    
    const newTradeId = result.recordset[0].id;
    res.status(201).json({ id: newTradeId, message: 'معامله با موفقیت ثبت شد' });
  } catch (err) {
    console.error('خطا در ثبت معامله:', err);
    res.status(500).json({ error: 'خطا در ثبت معامله' });
  }
});

// ذخیره تنظیمات ربات
app.post('/api/bot-settings', async (req, res) => {
  try {
    const { active, refreshInterval, coins, autoTrade } = req.body;
    
    // تبدیل شیء تنظیمات به JSON برای ذخیره در دیتابیس
    const settingsJson = JSON.stringify({ active, refreshInterval, coins, autoTrade });
    
    await sql.query`
      IF EXISTS (SELECT 1 FROM BotSettings WHERE id = 1)
        UPDATE BotSettings SET settings = ${settingsJson}, updated_at = GETDATE() WHERE id = 1
      ELSE
        INSERT INTO BotSettings (id, settings, updated_at) VALUES (1, ${settingsJson}, GETDATE())
    `;
    
    res.json({ message: 'تنظیمات ربات با موفقیت ذخیره شد' });
  } catch (err) {
    console.error('خطا در ذخیره تنظیمات ربات:', err);
    res.status(500).json({ error: 'خطا در ذخیره تنظیمات ربات' });
  }
});

// دریافت تنظیمات ربات
app.get('/api/bot-settings', async (req, res) => {
  try {
    const result = await sql.query`SELECT settings FROM BotSettings WHERE id = 1`;
    
    if (result.recordset.length > 0) {
      const settings = JSON.parse(result.recordset[0].settings);
      res.json(settings);
    } else {
      res.status(404).json({ error: 'تنظیمات ربات یافت نشد' });
    }
  } catch (err) {
    console.error('خطا در دریافت تنظیمات ربات:', err);
    res.status(500).json({ error: 'خطا در دریافت تنظیمات ربات' });
  }
});

// شروع سرور
app.listen(PORT, () => {
  console.log(`سرور در پورت ${PORT} راه‌اندازی شد`);
  connectToDatabase();
});

module.exports = app;
