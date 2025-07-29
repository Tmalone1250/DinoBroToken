// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol"; // No need for "as OpenZeppelinERC20" unless you have a name conflict
import "@openzeppelin/contracts/access/Ownable.sol";

contract DinoBroCoin is ERC20, Ownable { // Changed OpenZeppelinERC20.ERC20 to ERC20
    // Removed: using SafeMath for uint256;

    uint256 public constant INITIAL_SUPPLY = 1_000_000_000_000_000 * (10**9);
    uint256 public maxTxAmount;
    uint256 public maxWalletHolding;

    constructor(
        uint8 _maxTxPercent,
        uint8 _maxWalletPercent
    ) ERC20("DinoBro Coin", "DINOB") Ownable(msg.sender) { // Changed OpenZeppelinERC20.ERC20 to ERC20
        _mint(msg.sender, INITIAL_SUPPLY);
        maxTxAmount = (INITIAL_SUPPLY * _maxTxPercent) / 100; // Changed .mul and .div
        maxWalletHolding = (INITIAL_SUPPLY * _maxWalletPercent) / 100; // Changed .mul and .div
    }

    function _beforeTokenTransfer(
        address sender,
        address recipient,
        uint256 amount
    ) internal view { // Added 'override' as _beforeTokenTransfer is a virtual function in ERC20
        if (sender != address(0) && recipient != address(0)) {
            require(amount <= maxTxAmount, "DINOB: Transaction amount exceeds limit");
            if (recipient != address(this)) {
                require(
                    balanceOf(recipient) + amount <= maxWalletHolding, // Changed .add
                    "DINOB: Recipient wallet balance would exceed holding limit"
                );
            }
        }
    }

    function setMaxTxPercent(uint8 _maxTxPercent) public onlyOwner {
        require(_maxTxPercent > 0 && _maxTxPercent <= 100, "DINOB: Invalid percentage");
        maxTxAmount = (INITIAL_SUPPLY * _maxTxPercent) / 100;
    }

    function setMaxWalletPercent(uint8 _maxWalletPercent) public onlyOwner {
        require(_maxWalletPercent > 0 && _maxWalletPercent <= 100, "DINOB: Invalid percentage");
        maxWalletHolding = (INITIAL_SUPPLY * _maxWalletPercent) / 100;
    }
}