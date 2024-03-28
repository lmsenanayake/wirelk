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
contract StakingRupee is ERC20, Ownable {

    using Math for uint256;

    /// @notice The ERC20 contract LKRS
    StableRupee private immutable stableRupee;

    /// @notice Stores the staking duration
    uint256 public duration;

    /// @notice Stores the finishing time
    uint256 public finishAt;

    /// @notice Minimum of last updated time and reward finish time
    uint256 public updatedAt;

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

    error EmptyAmount(address sender, uint256 value);

    error InsufficientBalance(address sender, uint256 value);

    error IncorrectRewardRate(address sender, uint256 value);

    error RewardDurationNotFinish(uint256 finishTime, uint256 blockTime);

    error TransferFailed(address to, uint256 value);

    event StakeEth(address to, uint256 value);

    event StakeRupee(address to, uint256 value);

    event WithdrawEth(address to, uint256 value);

    event WithdrawRupee(address to, uint256 value);

    event RewardClaimed(address to, uint256 value);

    /// @notice Creates a contract of the Stake Stable Lankan Rupee (LKRS)
    /// @param initialOwner Address of the contract owner
    /// @param rupeeToken Address of the LKRS contract
    constructor(
        address initialOwner,
        address rupeeToken
    ) ERC20("Stable Lankan Rupee", "LKRS") Ownable(initialOwner) {
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
            stableRupee.getEthUsdRate()) / 1e18) +
            (((totalSupplyRupee * 1e18) / stableRupee.getUsdRupeeRate()));

        return
            rewardPerTokenStored +
            (rewardRate * rewardTime * 1e18) /
            totalSupInUsd;
    }

    /// @notice Allows users to stake LKRS
    /// @dev The staked LKRS are stored in balanceOfRupee
    function stakeRupee(uint256 _amount) external updateReward(_msgSender()) {
        if (_amount <= 0) {
            revert EmptyAmount(_msgSender(), _amount);
        }

        stableRupee.transferFrom(_msgSender(), address(this), _amount);
        balanceOfRupee[_msgSender()] += _amount;
        totalSupplyRupee += _amount;

        emit StakeRupee(_msgSender(), _amount);
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
    /// @param _amount Number of LKRS user want to withdraw
    function withdrawRupee(uint256 _amount) external updateReward(_msgSender()) {
        if (_amount <= 0) {
            revert EmptyAmount(_msgSender(), _amount);
        }

        if (balanceOfRupee[_msgSender()] < _amount) {
            revert InsufficientBalance(_msgSender(), _amount);
        }

        balanceOfRupee[_msgSender()] -= _amount;
        totalSupplyRupee -= _amount;
        stableRupee.transfer(_msgSender(), _amount);

        emit WithdrawRupee(_msgSender(), _amount);
    }

    /// @notice Allows users to withdraw the total number or less of staked ETH
    /// @param _amount Number of ETH user want to withdraw
    /// @dev The withdraw ETH number will be sent to user address
    function withdrawEth(uint256 _amount) external payable updateReward(_msgSender()) {
        if (_amount <= 0) {
            revert EmptyAmount(_msgSender(), _amount);
        }

        if (balanceOfEth[_msgSender()] < _amount) {
            revert InsufficientBalance(_msgSender(), _amount);
        }

        balanceOfEth[_msgSender()] -= _amount;
        totalSupplyEth -= _amount;

        (bool sent, ) = payable(_msgSender()).call{value: _amount}("");
        if (sent != true) {
            revert TransferFailed(_msgSender(), _amount);
        }

        emit WithdrawEth(_msgSender(), _amount);
    }

    /// @notice Returns the amount of earned tokens
    /// @param _account Address of the account to check
    function earned(address _account) public view returns (uint256) {
        uint256 totalBalanceOfInUsd = ((balanceOfEth[_account] * stableRupee.getEthUsdRate()) / 1e18 ) +
            (((balanceOfRupee[_account]*1e18) / stableRupee.getUsdRupeeRate()));

        return ((totalBalanceOfInUsd * (rewardPerToken() - userRewardPerTokenPaid[_account])) / 1e18) + rewards[_account];
    }

    /// @notice Used by the owner to chang de reward duration
    /// @dev Durations must be passed in seconds
    /// @param _duration Reward duration in seconds
    function setRewardsDuration(uint256 _duration) external onlyOwner {
        if (block.timestamp < finishAt) {
            revert RewardDurationNotFinish(finishAt, block.timestamp);
        }
        duration = _duration;
    }

    /// @notice Used by the owner to set the reward amount
    /// @dev Reward amount is devided by the duration
    /// @param _amount Reward amount
    function setRewardAmount(uint256 _amount) external onlyOwner {
        if (block.timestamp >= finishAt) {
            rewardRate = _amount / duration;
        } else {
            uint256 remainingRewards = (finishAt - block.timestamp) *
                rewardRate;
            rewardRate = (_amount + remainingRewards) / duration;
        }

        if (rewardRate <= 0) {
            revert IncorrectRewardRate(_msgSender(), rewardRate);
        }

        if (
            stableRupee.balanceOf(address(this)) <=
            ((rewardRate * duration) / 1e18)
        ) {
            revert InsufficientBalance(
                address(this),
                stableRupee.balanceOf(address(this))
            );
        }

        finishAt = block.timestamp + duration;
        updatedAt = block.timestamp;

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
    function getReward() external updateReward(_msgSender()) {
        uint256 reward = rewards[_msgSender()];

        if (reward <= 0) {
            revert InsufficientBalance(
                _msgSender(),
                reward
            );
        }

        rewards[_msgSender()] = 0;
        stableRupee.transfer(_msgSender(), reward);

        emit RewardClaimed(_msgSender(), reward);
    }
}
