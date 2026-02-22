🚀 Crypto Portfolio Tracker with Risk & Scam Analysis

An intelligent full-stack crypto portfolio management system that aggregates holdings across multiple exchanges, provides real-time pricing, detects scam tokens, and generates tax-ready P&L reports.

📌 Problem Statement

- Investors manage assets across multiple exchanges without a unified view.
- Existing trackers focus only on prices, not risk intelligence.
- Users unknowingly hold scam or rug-pull tokens.
- No integrated system combines portfolio tracking, risk detection, and tax reporting.

 🏗️ Project Structure

Crypto_Portfolio/
│
├── Crypto_Backend/        # Spring Boot backend
│   ├── src/
│   ├── pom.xml
│   └── ...
│
├── Crypto_Frontend/       # React + Vite frontend
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── .gitignore



🎯 Objective

- Aggregate crypto holdings from multiple exchanges.
- Provide real-time pricing and historical insights.
- Detect risky or scam tokens proactively.
- Generate accurate P&L and tax-ready summaries.
- Deliver a unified, risk-aware investment dashboard.
- 

🏗️ System Architecture

User → React Frontend → Spring Boot Backend → External APIs → MySQL Database → Analytics → UI

🔹 Layers

- **User Interface Layer** – Dashboards, charts, alerts, portfolio insights  
- **Business Logic Layer** – Portfolio computation, risk scoring, tax logic  
- **Data Aggregation Layer** – Scheduled jobs fetching prices and risk data  
- **Persistence Layer** – Stores users, trades, holdings, and alerts  
- **Security Layer** – JWT authentication & encrypted exchange API keys  


⚙️ Technology Stack

🔹Backend
- Java
- Spring Boot
- Maven
- JWT Authentication (Access + Refresh Tokens)
- MySQL
- Scheduled Cron Jobs

🔹Frontend
- React.js
- Vite
- Tailwind CSS

🔹 External APIs
- CoinGecko → Market pricing
- Binance → Exchange integration
- Etherscan → Contract verification
- CryptoScamDB → Scam detection

🔹Sample API Endpoints

| Method | Endpoint            | Description               |
|--------|---------------------|---------------------------|
| POST   | /api/auth/login     | User login                |
| GET    | /api/portfolio      | Fetch portfolio           |
| GET    | /api/prices         | Get live prices           |
| GET    | /api/risk/{token}   | Get token risk score      |
| GET    | /api/pnl            | P&L summary               |


 ✨ Core Features

📊 Portfolio Management
- Multi-exchange portfolio aggregation
- Manual wallet asset tracking
- Holdings & transaction history

 📈 Analytics
- Real-time P&L tracking
- Realized & unrealized gains
- Historical price charts
- Allocation insights

🚨 Risk & Scam Detection
- Contract reputation checks
- Scam token cross-verification
- Risk scoring system
- Smart alerts & notifications

🧾 Tax & Reporting
- P&L summaries
- Exportable CSV reports
- Tax event hints


 🗄️ Database Design
- Users
- Exchanges
- ApiKeys
- Holdings
- Trades
- PriceSnapshots
- RiskAlerts
- ScamTokens
