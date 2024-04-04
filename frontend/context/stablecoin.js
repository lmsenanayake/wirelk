"use client";
import { createContext, useContext, useEffect, useState } from "react";

const StablecoinContext = createContext({});
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";

import { stableContractAddress, stableContractAbi } from "@/constants";
import { publicClient } from '@/utils';

export const StablecoinContextProvider = ({ children }) => {
    const [dataStableBalanceOf, setDataStableBalanceOf] = useState("");
    const { address } = useAccount();

    const {
        data: stablecoinRupeeRate,
        // isLoading: stablecoinLoadingRupee,
        // isPending: stablecoinPendingRupee,
        // isFetching: stablecoinFetchingRupee,
        // refetch: refetchStablecoinRupee,
    } = useReadContract({
        address: stableContractAddress,
        abi: stableContractAbi,
        functionName: "getUsdRupeeRate",
        account: address,
    });

    const {
        data: stablecoinEthRate,
        // isLoading: stablecoinLoadingEth,
        // isPending: stablecoinPendingEth,
        // isFetching: stablecoinFetchingEth,
        // refetch: refetchStablecoinEth,
    } = useReadContract({
        address: stableContractAddress,
        abi: stableContractAbi,
        functionName: "getEthUsdRate",
        account: address,
    });

    const fetchStableBalanceOf = async() => {
        let balance = await publicClient.readContract({
                address: stableContractAddress,
                abi: stableContractAbi,
                functionName: 'balanceOf',
                account: address,
                args: [address] 
        });
        setDataStableBalanceOf(balance);
        return balance;
    }
    fetchStableBalanceOf();


    const values = { 
        stablecoinRupeeRate,
        stablecoinEthRate,
        dataStableBalanceOf,
        fetchStableBalanceOf,
    };

    return (
        <StablecoinContext.Provider value={values}>
            {children}
        </StablecoinContext.Provider>
    );
};

export const useStablecoinContext = () => useContext(StablecoinContext);