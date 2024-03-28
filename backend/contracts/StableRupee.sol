// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import {AggregatorV3Interface} from "@chainlink/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

/// @title Stable Lankan Rupee (LKRS) project
/// @author Lakshitha SENANAYAKE
/// @notice The stable coin for Sri Lankan Rupee
/// @dev This contract does not have the price stabilizer mechanism
/// @custom:experimental This contract was created for educational purposes.
contract StableRupee is ERC20, ERC20Burnable, Ownable {
    using SafeCast for int256;

    /// @notice Constant contains the LKR/USD decimal floating number
    /// @dev TODO Must be replaced by a datafeed of the oracle
    uint8 private constant LKRS_DECIMALS = 8;

    /// @notice Constant contains the LKR/USD exange rate
    /// @dev TODO Must be replaced by a datafeed of the oracle
    uint40 private constant LKRS_RATE = 30275000000;

    /// @notice Chainlink datafeed Aggregator Interface
    AggregatorV3Interface internal dataFeed;

    /// @notice Emits when a user buys new LKRS tokens
    /// @param to The new owner address
    /// @param value The number of LKRS tokens minted
    event Buy(address indexed to, uint256 value);

    /// @notice Emits when the owner withdraw all ETH
    /// @param to The owner address
    /// @param value The number of ETH withdraw
    event Withdraw(address indexed to, uint256 value);

    /// @notice Indicates an error related to the current ETH value sent
    /// @param sender Address of the contract user
    error EmptyValue(address sender);

    error Log(address sender, uint256 value, uint256 value2, uint256 value3);

    /// @notice Creates a ERC20 contract for the Stable Lankan Rupee (LKRS)
    /// @param initialOwner Address of the contract owner
    /// @param oracleEthUsdAddr Oracle address which contains ETH/USD echange rate
    constructor(
        address initialOwner,
        address oracleEthUsdAddr
    ) ERC20("Stable Lankan Rupee", "LKRS") Ownable(initialOwner) {
        dataFeed = AggregatorV3Interface(oracleEthUsdAddr);
    }

    /// @notice Used only by the owner to mint LKRS tokens
    /// @param to Address which gets the minted tokens
    /// @param amount Number of LKRS tokens to be minted
    function mint(address to, uint256 amount) external onlyOwner {
        _mint(to, amount);
    }

    /// @notice Allows users to buy LKRS token with ETH
    /// @dev Reverts if the ETH value received is empty
    function buy() external payable {
        if (msg.value <= 0) {
            revert EmptyValue(_msgSender());
        }

        uint256 amount = ((((msg.value * getEthUsdRate()) / 1 ether) *
            getUsdRupeeRate()) / 10 ** decimals());
        // revert Log(
        //     _msgSender(),
        //     amount,
        //     getUsdRupeeRate(),
        //     amount / 10 ** decimals()
        // );
        _mint(_msgSender(), amount);

        emit Buy(_msgSender(), amount);
    }

    /// @notice Allows the owner to withdraw all stored ETH in this contract
    /// @dev Reverts if the contract ETH balance is empty
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

    /// @notice Returns the ETH/USD exchange rate from Chainlink
    /// @dev Oracle returns the price with 8 decimals precision
    function getEthUsdRate() public view returns (uint) {
        //(, int price, , , ) = dataFeed.latestRoundData();

        // TODO calculate with DECIMALS
        //uint8 Decimals = dataFeed.decimals();
        //uint Price = uint(price);
        //revert EmptyValue(_msgSender(), uint(price));
        //return Price / 10 ** Decimals;
        //return price.toUint256();
        uint256 price = 356700000000;
        uint8 dec = 8;
        // Converting the price to 1e18 in order to have correct decimals
        return (price * 10 ** decimals()) / 10 ** dec;
    }

    /// @notice Returns the USD/LKR exchange rate (temporary stored in constant)
    /// @dev TODO must replaced by a request to the Oracle's custom datafeeds
    function getUsdRupeeRate() public view returns (uint256) {
        // Converting the rate to 1e18 in order to have correct decimals
        return (LKRS_RATE * 10 ** decimals()) / 10 ** LKRS_DECIMALS;
    }
}
