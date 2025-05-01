
# Cryptocurrency Arbitrage Trading Bot

## Overview

This application is a real-time cryptocurrency arbitrage trading bot that monitors price differences across multiple exchanges and executes trades automatically when profitable opportunities are detected. It supports multiple cryptocurrencies and exchanges, with a clean dashboard UI for monitoring and configuration.

## Features

- **Real-time arbitrage detection** across major cryptocurrency exchanges
- **Automated trading** based on configurable profit thresholds
- **Multiple cryptocurrency support** (ETH, BNB, SOL, USDT, USDC, etc.)
- **Wallet integration** with MetaMask and other Web3 wallets
- **Historical trade tracking** and profit analytics
- **Exchange API key management** for automated trading
- **Advanced trading strategies** (MEV, Flash Loans, Token Sniping)

## Setup Instructions

### Prerequisites

- Node.js 16+
- npm or yarn
- A Web3 wallet (MetaMask recommended)
- Exchange API keys (for automated trading)

### Frontend Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/crypto-arbitrage-bot.git
   cd crypto-arbitrage-bot
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm run dev
   ```

### Backend Setup

The application requires a backend server for optimal functionality:

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install backend dependencies:
   ```
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```
   DB_CONNECTION_STRING=your_database_connection_string
   PORT=5000
   JWT_SECRET=your_jwt_secret
   ```

4. Start the backend server:
   ```
   npm start
   ```

## Usage Guide

### Connecting Your Wallet

1. Click on "Connect Wallet" button in the top right corner
2. Select your preferred wallet provider (MetaMask, WalletConnect, etc.)
3. Approve the connection request in your wallet

### Setting Up Exchange Connections

1. Navigate to the "API Settings" section
2. Add your exchange API keys for each exchange you wish to use
3. Ensure your API keys have trading permissions enabled

### Configuring the Bot

1. Go to the "Bot Settings" section
2. Select which coins to monitor for arbitrage
3. Set your minimum profit percentage thresholds
4. Configure maximum trades per day and other parameters

### Starting the Bot

1. Navigate to the Dashboard
2. Click the "Start Bot" button to begin monitoring
3. The bot will scan for arbitrage opportunities based on your settings
4. When profitable opportunities are found, trades will execute automatically (if auto-trading is enabled)

## Offline Mode

The application features an offline mode that uses simulated data when the backend server is unavailable. This is useful for:

1. Testing the interface without a server connection
2. Developing new features in isolation
3. Demonstrating the application without real exchange connections

To use offline mode, simply run the frontend without starting the backend server.

## Security Considerations

- All API keys are encrypted before storage
- Keys can be stored locally in the browser or on the server (when available)
- We recommend using API keys with trading-only permissions and IP restrictions
- Never share your private keys or API secrets with anyone

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
