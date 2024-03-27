// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StableRupee.sol";

contract StakingRupee is Ownable {
    using Math for uint256;

    StableRupee public immutable stableRupee;

    uint24 private factor = 1e6;

    // Duration of rewards to be paid out (in seconds)
    uint256 public duration;
    // Timestamp of when the rewards finish
    uint256 public finishAt;
    // Minimum of last updated time and reward finish time
    uint256 public updatedAt;

    // Total staked
    uint256 public totalSupplyRupee;

    // Total staked
    uint256 public totalSupplyEth;

    // Reward to be paid out per second
    uint256 public rewardRate;

    // Sum of (reward rate * dt * 1e18 / total supply)
    uint256 public rewardPerTokenStored;

    // User address => staked amount
    mapping(address => uint256) public balanceOfRupee;

    // User address => staked amount
    mapping(address => uint256) public balanceOfEth;

    // User address => rewardPerTokenStored
    mapping(address => uint256) public userRewardPerTokenPaid;

    // User address => rewards to be claimed
    mapping(address => uint256) public rewards;

    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param value Current balance for the interacting account.
     */
    error Log(address sender, uint256 value, uint256 value2, uint256 value3);

    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param value Current balance for the interacting account.
     */
    error EmptyAmount(address sender, uint256 value);

    /**
     * @dev Indicates an error related to the current `balance` of a `sender`. Used in transfers.
     * @param sender Address whose tokens are being transferred.
     * @param value Current balance for the interacting account.
     */
    error InsufficientBalance(address sender, uint256 value);

    constructor(
        address initialOwner,
        address rupeeToken
    ) Ownable(initialOwner) {
        stableRupee = StableRupee(rupeeToken);
    }

    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }

        _;
    }

    function lastTimeRewardApplicable() public view returns (uint256) {
        return finishAt.min(block.timestamp);
    }

    function rewardPerToken() public view returns (uint256) {
        if (totalSupplyRupee == 0 && totalSupplyEth == 0) {
            return rewardPerTokenStored;
        }

        uint256 totalSupInUsd = (totalSupplyEth * stableRupee.getEthUsdRate()) +
            (totalSupplyRupee * stableRupee.getRupeeUsdRate());

        return
            rewardPerTokenStored +
            (rewardRate * (lastTimeRewardApplicable() - updatedAt) * 1e18) /
            totalSupInUsd;
    }

    function stakeRupee(uint256 _amount) external updateReward(_msgSender()) {
        if (_amount <= 0) {
            revert EmptyAmount(_msgSender(), _amount);
        }

        stableRupee.transferFrom(_msgSender(), address(this), _amount);
        balanceOfRupee[_msgSender()] += _amount;
        totalSupplyRupee += _amount;
    }

    function stakeEth() external payable updateReward(_msgSender()) {
        if (msg.value <= 0) {
            revert EmptyAmount(_msgSender(), msg.value);
        }

        balanceOfEth[_msgSender()] += msg.value;
        totalSupplyEth += msg.value;
    }

    function withdrawRupee(
        uint256 _amount
    ) external updateReward(_msgSender()) {
        if (_amount <= 0) {
            revert EmptyAmount(_msgSender(), _amount);
        }

        if (balanceOfRupee[_msgSender()] < _amount) {
            revert InsufficientBalance(_msgSender(), _amount);
        }

        balanceOfRupee[_msgSender()] -= _amount;
        totalSupplyRupee -= _amount;
        stableRupee.transfer(_msgSender(), _amount);
    }

    function withdrawEth(
        uint256 _amount
    ) external payable updateReward(_msgSender()) {
        if (_amount <= 0) {
            revert EmptyAmount(_msgSender(), _amount);
        }

        if (balanceOfEth[_msgSender()] < _amount) {
            revert InsufficientBalance(_msgSender(), _amount);
        }

        balanceOfEth[_msgSender()] -= _amount;
        totalSupplyEth -= _amount;

        // Send the total balance stored in the contract to the owner
        (bool sent, ) = payable(_msgSender()).call{value: _amount}("");
        require(sent, "Failed to send Ether");
    }

    function earned(address _account) public view returns (uint256) {
        uint256 totalBalanceOfInUsd = (balanceOfEth[_account] *
            stableRupee.getEthUsdRate()) +
            (balanceOfRupee[_account] * stableRupee.getRupeeUsdRate());

        return
            ((totalBalanceOfInUsd *
                (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) +
            rewards[_account];
    }

    function setRewardsDuration(uint256 _duration) external onlyOwner {
        require(finishAt < block.timestamp, "reward duration not finished");
        duration = _duration;
    }

    /**
     * amount in LKRS
     */
    function setRewardAmount(uint256 _amount) external onlyOwner {
        if (block.timestamp >= finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint256 remainingRewards = (finishAt - block.timestamp) *
                rewardRate;
            rewardRate = (_amount + remainingRewards) / duration;
        }

        require(rewardRate > 0, "reward rate = 0");
        require(
            (rewardRate * duration).ceilDiv(factor) <=
                stableRupee.balanceOf(address(this)),
            "reward amount > balance"
        );

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;

        // revert Log(
        //     address(this),
        //     finishAt,
        //     updatedAt,
        //     finishAt.min(block.timestamp)
        // );
    }

    function getStakedRupeeNumber() external view returns (uint256) {
        return balanceOfRupee[_msgSender()];
    }

    function getStakedEthNumber() external view returns (uint256) {
        return balanceOfEth[_msgSender()];
    }

    function getReward() external updateReward(_msgSender()) {
        uint256 reward = rewards[_msgSender()];
        if (reward > 0) {
            rewards[_msgSender()] = 0;
            stableRupee.transfer(_msgSender(), reward);
        }
    }
}
