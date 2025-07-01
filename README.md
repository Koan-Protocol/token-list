# 🧬 Koan Protocol Token-List

[![License: GPL-3.0-or-later](https://img.shields.io/badge/License-GPL--3.0--or--later-blue.svg)](https://github.com/Koan-Protocol/token-list/blob/main/LICENSE)

## Overview

This repository maintains the **official token lists and helper APIs** for **Koan Protocol**, an African‑rooted Concentrated Liquidity AMM (CLAMM) built on Lisk & Base. It currently includes:

- ✅ **testnet-token-list** for Lisk Sepolia & Base testnets
- 🧪 Helper APIs: token metadata, discovery, and lookup
- 🚀 Foundation for upcoming APIs: **faucet**, rate-check, on‑chain analytics

These tools enable secure, scalable token management and developer integrations—ensuring Koan grows seamlessly as we launch the testnet, faucet, campaign tools, and on-ramp integrations.

---

## 📦 Token Lists

- `testnet-token-list.json` — tokens available on Lisk Sepolia and Base testnets  
  Use in dApps to ensure UI token dropdowns remain accurate and secure  
- Metadata includes `chainId`, `address`, `symbol`, `name`, `decimals`, and `logoURI`

### Install & Use

```bash
npm install @koanprotocol/testnet-token-list
Example (JavaScript):

js
Copy
Edit
import tokenList from '@koanprotocol/testnet-token-list';
console.log(tokenList.tokens);
