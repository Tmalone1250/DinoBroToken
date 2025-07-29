# DinoBro Token (DINOB)

An ERC-20 compliant token, DinoBro Coin (DINOB), developed using Hardhat, featuring custom transaction amount and wallet holding limits to manage token distribution.

## Table of Contents
- [Features](#features)
- [Getting Started](#getting-started)
- [Contract Details](#contract-details)
- [Development and Usage](#development-and-usage)
- [License](#license)

## Features
- **ERC-20 Standard Compliance**: Follows the widely accepted ERC-20 token standard.
- **Ownable**: Utilizes OpenZeppelin's `Ownable` contract, allowing the deployer to manage specific token parameters.
- **Transaction Limits (`maxTxAmount`)**: Prevents any single transaction from exceeding a predefined percentage of the total supply.
- **Wallet Holding Limits (`maxWalletHolding`)**: Restricts individual wallet balances from exceeding a predefined percentage of the total supply (excluding the contract address itself).
- **Initial Supply**: A fixed initial supply of tokens minted to the contract deployer.

## Getting Started

### Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Git](https://git-scm.com/)

### Installation
1. Clone the repository:
   ```bash
   git clone [https://github.com/Tmalone1250/DinoBroToken.git](https://github.com/Tmalone1250/DinoBroToken.git)