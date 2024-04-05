"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { publicClient } from '@/utils';
const StakingContext = createContext({});
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";

import { 
    stableContractAddress, 
    stableContractAbi,
    stakingContractAddress, 
    stakingContractAbi  
} from "@/constants";

export const StakingContextProvider = ({ children }) => {
    
    const { address } = useAccount();
    const [dataStakingRupeeNumber, setDataStakingRupeeNumber] = useState();
    const [dataStakingEthNumber, setDataStakingEthNumber] = useState();
    const [dataStakingEarnings, setDataStakingEarnings] = useState();

    const fetchStakingRupeeNumber = async() => {
        let balance = await publicClient.readContract({
                address: stakingContractAddress,
                abi: stakingContractAbi,
                functionName: 'getStakedRupeeNumber',
                account: address
        });
        setDataStakingRupeeNumber(balance);
        return balance;
    }
    fetchStakingRupeeNumber();

    const fetchStakingEthNumber = async() => {
        let balance = await publicClient.readContract({
                address: stakingContractAddress,
                abi: stakingContractAbi,
                functionName: 'getStakedEthNumber',
                account: address
        });
        setDataStakingEthNumber(balance);
        return balance;
    }
    fetchStakingEthNumber();

    const fetchStakingEarnings = async() => {
        let balance = await publicClient.readContract({
            address: stakingContractAddress,
            abi: stakingContractAbi,
            functionName: 'earned',
            account: address,
            args: [address] 
        });
        setDataStakingEarnings(balance);
        return balance;
    }

    const values = {
        dataStakingRupeeNumber,
        dataStakingEthNumber,
        dataStakingEarnings,
        fetchStakingRupeeNumber,
        fetchStakingEthNumber,
        fetchStakingEarnings
    };

    return (
        <StakingContext.Provider value={values}>
            {children}
        </StakingContext.Provider>
    );
};

export const useStakingContext = () => useContext(StakingContext);