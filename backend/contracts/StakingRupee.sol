// SPDX-License-Identifier: MIT
// Compatible with OpenZeppelin Contracts ^5.0.0
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./StableRupee.sol";

/// @title Stable Lankan Rupee (LKRS) Staking project
/// @author Lakshitha SENANAYAKE
/// @notice The staking mechanism for the Stable Sri Lankan Rupee (LKRS)
/// @dev This contract has 2 pools of staking with ETH and LKRS
/// @custom:experimental This contract was created for educational purposes.
contract StakingRupee is Ownable {

    using Math for uint256;

    /// @notice Constant contains 1e18 multiplier/divider
    /// @dev Used to handle price decimals
    uint64 private constant FACTOR = 1e18;

    /// @notice The ERC20 contract LKRS
    StableRupee private immutable stableRupee;

    /// @notice Stores the finishing time
    uint256 private finishAt;

    /// @notice Minimum of last updated time and reward finish time
    uint256 private updatedAt;

    /// @notice Stores the staking duration
    uint256 public duration;

    /// @notice Total staked LKRS token
    uint256 public totalSupplyRupee;

    /// @notice Total staked ETH number
    uint256 public totalSupplyEth;

    /// @notice Reward to be paid out per second
    uint256 public rewardRate;

    /// @notice Sum of (reward rate * dt * 1e18 / total supply)
    uint256 public rewardPerTokenStored;

    /// @notice User address => staked balance amount for LKRS
    mapping(address => uint256) public balanceOfRupee;

    /// @notice User address => staked balance amount for ETH
    mapping(address => uint256) public balanceOfEth;

    /// @notice User address => rewardPerTokenStored
    mapping(address => uint256) public userRewardPerTokenPaid;

    /// @notice User address => rewards to be claimed
    mapping(address => uint256) public rewards;

    error Log(address sender, uint256 value, uint256 value2, uint256 value3);

    /// @notice Indicates an error of empty amount
    /// @param sender The address of the sender
    /// @param value The amount
    error EmptyAmount(address sender, uint256 value);

    /// @notice Indicates an error when token transfering
    /// @param sender The address of the sender
    /// @param value The amount
    error TokenTransferError(address sender, uint256 value);

    /// @notice Indicates an error of balance
    /// @param sender The address of the sender
    /// @param value The value of the balance
    error InsufficientBalance(address sender, uint256 value);

    /// @notice Error when the reward is equal to 0
    /// @param sender The address of the sender
    /// @param value The value of the reward
    error IncorrectRewardRate(address sender, uint256 value);

    /// @notice Triggered when try to change the duration if period not OK
    /// @param finishTime The finishing time of reward
    /// @param blockTime The time of the current block
    error RewardDurationNotFinish(uint256 finishTime, uint256 blockTime);

    /// @notice Triggered when the transfer went wrong
    /// @param to The address of the recipient
    /// @param value The value of the transfered amount
    error TransferFailed(address to, uint256 value);

    /// @notice Emits when user stake stake ETH
    /// @param to The user address
    /// @param value The number of ETH
    event StakeEth(address to, uint256 value);

    /// @notice Emits when user stake stake LKRS
    /// @param to The user address
    /// @param value The number of LKRS
    event StakeRupee(address to, uint256 value);

    /// @notice Emits when user withdraw staked ETH
    /// @param to The user address
    /// @param value The number of ETH
    event WithdrawEth(address to, uint256 value);

    /// @notice Emits when user withdraw staked LKRS
    /// @param to The user address
    /// @param value The number of LKRS
    event WithdrawRupee(address to, uint256 value);

    /// @notice Emits when reward are claimed by user
    /// @param to The user address
    /// @param value The number of rewards
    event RewardClaimed(address to, uint256 value);

    /// @notice Emits when owner set new reward amount
    /// @param time The update time
    /// @param value The number of rewards
    event RewardRateChanged(uint256 time, uint256 value);

    /// @notice Creates a contract of the Stake Stable Lankan Rupee (LKRS)
    /// @param initialOwner Address of the contract owner
    /// @param rupeeToken Address of the LKRS contract
    constructor(address initialOwner, address rupeeToken) Ownable(initialOwner) {
        stableRupee = StableRupee(rupeeToken);
    }

    /// @notice Modifier used to calculate rewards
    /// @param _account Address of the sender
    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            rewards[_account] = earned(_account);
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
        }

        _;
    }

    /// @notice Calculate the min time for reward
    /// @dev Using Math min function
    /// @return uint256 Returns the min time
    function lastTimeRewardApplicable() public view returns (uint256) {
        return finishAt.min(block.timestamp);
    }

    /// @notice Calculate the reward per token based on total supply
    /// @dev Uses the 2 pools to calculate the allowed reward
    /// @return uint256 Returns the calculated reward per token
    function rewardPerToken() public view returns (uint256) {
        if (totalSupplyRupee == 0 && totalSupplyEth == 0) {
            return rewardPerTokenStored;
        }
        // Hack to avoid calculation error when lasttime is equal to update
        uint256 rewardTime = lastTimeRewardApplicable() - updatedAt;
        if (rewardTime <= 0) {
            rewardTime = 1;
        }

        uint256 totalSupInUsd = ((totalSupplyEth *
            stableRupee.getEthUsdRate()) / FACTOR) +
            (((totalSupplyRupee * FACTOR) / stableRupee.getUsdRupeeRate()));

        return
            rewardPerTokenStored +
            (rewardRate * rewardTime * FACTOR) /
            totalSupInUsd;
    }

    /// @notice Allows users to stake LKRS
    /// @dev The staked LKRS are stored in balanceOfRupee
    function stakeRupee(uint256 amount) external updateReward(_msgSender()) {
        if (amount <= 0) {
            revert EmptyAmount(_msgSender(), amount);
        }

        emit StakeRupee(_msgSender(), amount);

        bool success = stableRupee.transferFrom(_msgSender(), address(this), amount);
        if (!success) {
            revert TokenTransferError(_msgSender(), amount);
        }

        balanceOfRupee[_msgSender()] += amount;
        totalSupplyRupee += amount;
    }

    /// @notice Allows users to stake ETH
    /// @dev The staked ETH are stored in balanceOfEth
    function stakeEth() external payable updateReward(_msgSender()) {
        if (msg.value <= 0) {
            revert EmptyAmount(_msgSender(), msg.value);
        }

        balanceOfEth[_msgSender()] += msg.value;
        totalSupplyEth += msg.value;

        emit StakeEth(_msgSender(), msg.value);
    }

    /// @notice Allows users to withdraw the total number or less of staked LKRS
    /// @param amount Number of LKRS user want to withdraw
    function withdrawRupee(uint256 amount) external updateReward(_msgSender()) {
        if (amount <= 0) {
            revert EmptyAmount(_msgSender(), amount);
        }

        if (balanceOfRupee[_msgSender()] < amount) {
            revert InsufficientBalance(_msgSender(), amount);
        }

        balanceOfRupee[_msgSender()] -= amount;
        totalSupplyRupee -= amount;

        bool success = stableRupee.transfer(_msgSender(), amount);
        if (!success) {
            revert TokenTransferError(_msgSender(), amount);
        }

        emit WithdrawRupee(_msgSender(), amount);
    }

    /// @notice Allows users to withdraw the total number or less of staked ETH
    /// @param amount Number of ETH user want to withdraw
    /// @dev The withdraw ETH number will be sent to user address
    function withdrawEth(uint256 amount) external payable updateReward(_msgSender()) {
        if (amount <= 0) {
            revert EmptyAmount(_msgSender(), amount);
        }

        if (balanceOfEth[_msgSender()] < amount) {
            revert InsufficientBalance(_msgSender(), amount);
        }

        balanceOfEth[_msgSender()] -= amount;
        totalSupplyEth -= amount;

        (bool sent, ) = payable(_msgSender()).call{value: amount}("");
        if (sent != true) {
            revert TransferFailed(_msgSender(), amount);
        }

        emit WithdrawEth(_msgSender(), amount);
    }

    /// @notice Returns the amount of earned tokens
    /// @param account Address of the account to check
    function earned(address account) public view returns (uint256) {
        uint256 totalBalanceOfInUsd = ((balanceOfEth[account] * stableRupee.getEthUsdRate()) / FACTOR ) +
            (((balanceOfRupee[account] * FACTOR) / stableRupee.getUsdRupeeRate()));

        return ((totalBalanceOfInUsd * (rewardPerToken() - userRewardPerTokenPaid[account])) / FACTOR) + rewards[account];
    }

    /// @notice Used by the owner to chang de reward duration
    /// @dev Durations must be passed in seconds
    /// @param durationSeconds Reward duration in seconds
    function setRewardsDuration(uint256 durationSeconds) external onlyOwner {
        if (block.timestamp < finishAt) {
            revert RewardDurationNotFinish(finishAt, block.timestamp);
        }
        duration = durationSeconds;
    }

    /// @notice Used by the owner to set the reward amount
    /// @dev Reward amount is devided by the duration
    /// @param amount Reward amount
    function setRewardAmount(uint256 amount) external updateReward(address(0)) onlyOwner {
        if (block.timestamp >= finishAt) {
            rewardRate = amount / duration;
        } else {
            uint256 remainingRewards = (finishAt - block.timestamp) *
                rewardRate;
            rewardRate = (amount + remainingRewards) / duration;
        }

        if (rewardRate <= 0) {
            revert IncorrectRewardRate(_msgSender(), rewardRate);
        }

        if (
            stableRupee.balanceOf(address(this)) <=
            ((rewardRate * duration) / FACTOR)
        ) {
            revert InsufficientBalance(
                address(this),
                stableRupee.balanceOf(address(this))
            );
        }

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;

        emit RewardRateChanged(updatedAt, rewardRate);
        // revert Log(address(this), _amount, rewardRate, updatedAt);
    }

    /// @notice Returns the user's staked LKRS token balance
    /// @return uint256 Number of LRKR tokens of the user balance
    function getStakedRupeeNumber() external view returns (uint256) {
        return balanceOfRupee[_msgSender()];
    }

    /// @notice Returns the user's staked ETH balance
    /// @return uint256 Number of ETH of the user balance
    function getStakedEthNumber() external view returns (uint256) {
        return balanceOfEth[_msgSender()];
    }

    /// @notice Allows the user to claim the earned rewards
    /// @dev The earned tokens will be   to the user address
    /// @return uint256 Returns the reward amount
    function claimReward() external updateReward(_msgSender()) returns(uint256) {
        uint256 reward = rewards[_msgSender()];

        if (reward <= 0) {
            revert InsufficientBalance(
                _msgSender(),
                reward
            );
        }

        emit RewardClaimed(_msgSender(), reward);

        rewards[_msgSender()] = 0;
        bool success = stableRupee.transfer(_msgSender(), reward);
        if (!success) {
            revert TokenTransferError(_msgSender(), reward);
        }

        return reward;
    }
}
