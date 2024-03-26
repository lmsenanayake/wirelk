// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StableRupee is ERC20, ERC20Burnable, Ownable {
    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param amount Current balance for the interacting account.
     */
    error EmptyAmount(address sender, uint256 amount);

    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param value Current balance for the interacting account.
     */
    error EmptyValue(address sender, uint256 value);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Buy(address indexed to, uint256 value);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Withdraw(address indexed to, uint256 value);

    constructor(
        address initialOwner
    ) ERC20("Stable Lankan Rupee", "LKRS") Ownable(initialOwner) {}

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function buy(uint256 amount) external payable {
        if (amount <= 0) {
            revert EmptyAmount(_msgSender(), amount);
        }

        if (msg.value <= 0) {
            revert EmptyValue(_msgSender(), msg.value);
        }

        _mint(_msgSender(), amount);
    }

    function withdraw() external payable onlyOwner {
        uint256 balanace = address(this).balance;
        if (balanace <= 0) {
            revert ERC20InsufficientBalance(owner(), balanace, 0);
        }
        
        // Send the total balance stored in the contract to the owner
        (bool sent, ) = payable(owner()).call{value: balanace}("");
        require(sent, "Failed to send Ether");
    }
}
