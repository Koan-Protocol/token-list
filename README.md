# Koan Protocol Token List & API

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Built with pnpm](https://img.shields.io/badge/Built%20with-pnpm-ff69b4)](https://pnpm.io/)

# Koan Protocol Token List & API Suite

> A comprehensive decentralized exchange (DEX) token registry and API infrastructure for the Koan Protocol ecosystem

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![API Status](https://img.shields.io/badge/API-Active-green)]()
[![DeFi](https://img.shields.io/badge/DeFi-Protocol-blue)]()
[![Web3](https://img.shields.io/badge/Web3-Infrastructure-purple)]()

## 🌐 Overview

The Koan Protocol Token List serves as the foundational infrastructure for token discovery, verification, and integration within the Koan ecosystem. This repository maintains a curated and community-verified registry of tokens, providing essential APIs for DEX operations, faucet services, and developer tooling.

### Key Features

- **📋 Curated Token Registry**: Comprehensive list of verified tokens with metadata
- **🔌 RESTful API**: Production-ready endpoints for token data retrieval
- **🚰 Faucet Integration**: Built-in testnet token distribution system
- **🛠️ Developer Tools**: Helper APIs for blockchain interactions
- **⚡ High Performance**: Optimized for low-latency trading operations
- **🔒 Security First**: Multi-layer verification and validation processes

## 🏗️ Architecture

This repository implements a microservices architecture designed for scalability and reliability:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Token List    │    │   Faucet API    │    │  Helper APIs    │
│   Management    │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  Core Registry  │
                    │   & Validation  │
                    └─────────────────┘
```

## 🚀 API Endpoints

### Token List API

**Base URL**: `https://api.koan-protocol.com/v1`

#### Get All Tokens

```bash
GET /tokens
```

Returns the complete list of verified tokens with metadata.

#### Get Token by Symbol

```bash
GET /tokens/{symbol}
```

Retrieve specific token information by symbol.

#### Get Token by Contract Address

```bash
GET /tokens/address/{contract_address}
```

Fetch token details using contract address.

### Faucet API

#### Request Testnet Tokens

```bash
POST /faucet/request
```

Request testnet tokens for development and testing.

#### Get Faucet Status

```bash
GET /faucet/status/{address}
```

Check faucet cooldown and available tokens for an address.

### Helper APIs

#### Validate Token Contract

```bash
POST /helpers/validate-contract
```

Validate token contract implementation and security.

#### Get Price Data

```bash
GET /helpers/price/{symbol}
```

Retrieve current market price data for tokens.

#### Gas Estimation

```bash
GET /helpers/gas-estimate
```

Get current network gas price estimates.

## 📁 Repository Structure

```
koan-protocol-token-list/
├── token-api/
│   ├── tokens/              # Token list API endpoints
│   ├── faucet/              # Faucet service implementation
│   └── helpers/             # Utility and helper APIs
├── token-list/
│   ├── tokens/              # Token metadata and configurations
│   ├── schemas/             # JSON schemas for validation
│   └── assets/              # Token logos and assets
├── testnet-faucet-api/

│   ├── /          # Token validation scripts
│   ├── /          # Deployment automation
│   └── /          # Health check and monitoring
```

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### Quick Start

1. **Clone the repository**

   ```bash
   git clone https://github.com/Koan-Protocol/token-list.git
   cd token-list
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Run database migrations**

   ```bash
   npm run migrate
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

### Docker Setup

```bash
docker-compose up -d
```

## 🪙 Token Listing Process

### Automatic Listings

Tokens meeting specific criteria are automatically indexed:

- Minimum liquidity threshold
- Contract verification status
- Trading volume requirements

### Community Proposals

Submit token listing proposals via GitHub issues:

1. Create a new issue using the token proposal template
2. Provide required token metadata
3. Community review and voting process
4. Technical validation and security audit

### Governance

Token listings are governed by the Koan Protocol DAO:

- Proposal submission: 1000 KOAN tokens
- Voting period: 7 days
- Quorum: 10% of circulating supply

## 🔐 Security & Validation

### Multi-Layer Security

- **Contract Auditing**: Automated security scans for all listed tokens
- **Metadata Verification**: Cross-platform validation of token information
- **Rate Limiting**: API protection against abuse and DoS attacks
- **Input Validation**: Comprehensive sanitization of all user inputs

### Faucet Security

- **Cooldown Periods**: Prevents abuse with time-based restrictions
- **IP Rate Limiting**: Network-level protection
- **CAPTCHA Integration**: Human verification for requests
- **Balance Monitoring**: Automatic refill and alert systems

## 🛠️ Integration Examples

### JavaScript/TypeScript

```javascript
import { KoanTokenList } from "@koan-protocol/token-list-sdk";

const tokenList = new KoanTokenList();
const tokens = await tokenList.getTokens();
const ethToken = await tokenList.getTokenBySymbol("ETH");
```

### Python

```python
import requests

response = requests.get('https://api.koan-protocol.com/v1/tokens')
tokens = response.json()
```

### Curl

```bash
curl -X GET "https://api.koan-protocol.com/v1/tokens" \
     -H "accept: application/json"
```

## 🚰 Faucet Usage

### Requesting Testnet Tokens

```bash
curl -X POST "https://api.koan-protocol.com/v1/faucet/request" \
     -H "Content-Type: application/json" \
     -d '{
       "address": "0x742F35Cc6C8C9...",
       "token": "KOAN",
       "amount": "100"
     }'
```

### Supported Testnet Networks

- Lisk Sepolia
- Base Sepolia

## 📊 Monitoring & Analytics

### Health Endpoints

- `GET /health` - Service health status
- `GET /metrics` - Prometheus metrics
- `GET /status` - Detailed system status

### Performance Metrics

- Averag
