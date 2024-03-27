// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract StableRupee is ERC20, ERC20Burnable, Ownable {
    using SafeCast for int256;

    //The total number of NFTs
    uint256 private constant LKRS_RATE = 30275;

    AggregatorV3Interface internal dataFeed;

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
    event Mint(address indexed to, uint256 value);

    /**
     * @dev Emitted when `value` tokens are moved from one account (`from`) to
     * another (`to`).
     *
     * Note that `value` may be zero.
     */
    event Withdraw(address indexed to, uint256 value);

    constructor(
        address initialOwner,
        address oracleEthUsdAddr
    ) ERC20("Stable Lankan Rupee", "LKRS") Ownable(initialOwner) {
        dataFeed = AggregatorV3Interface(oracleEthUsdAddr);
    }

    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    function swap() external payable {
        if (msg.value <= 0) {
            revert EmptyValue(_msgSender(), msg.value);
        }

        uint256 amount = (((msg.value / 1 ether) * getEthUsd()) * LKRS_RATE) /
            1e10;

        _mint(_msgSender(), amount);

        emit Mint(_msgSender(), amount);
    }

    function withdrawAllEth() external payable onlyOwner {
        uint256 balanace = address(this).balance;
        if (balanace <= 0) {
            revert ERC20InsufficientBalance(owner(), balanace, 0);
        }

        // Send the total balance stored in the contract to the owner
        (bool sent, ) = payable(owner()).call{value: balanace}("");
        require(sent, "Failed to send Ether");

        emit Withdraw(owner(), balanace);
    }

    function getEthUsd() public view returns (uint) {
        (, int price, , , ) = dataFeed.latestRoundData();

        //uint8 Decimals = dataFeed.decimals();
        //uint Price = uint(price);
        //revert EmptyValue(_msgSender(), uint(price));
        //return Price / 10 ** Decimals;
        return price.toUint256();
    }
}
