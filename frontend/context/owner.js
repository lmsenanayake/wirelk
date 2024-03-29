"use client";
import { createContext, useContext, useEffect, useState } from "react";

const OwnerContext = createContext({});
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";

import { contractAddress, contractAbi } from "@/constants";

export const OwnerContextProvider = ({ children }) => {
  const [owner, setOwner] = useState();

  const { address } = useAccount();

  const {
    data: contractOwner,
    idLoading: ownerLoading,
    refetch: refetchOwner,
  } = useReadContract({
    address: contractAddress,
    abi: contractAbi,
    functionName: "owner",
    account: address,
  });

  useEffect(() => {
    if (contractOwner === address) {
      setOwner(contractOwner);
      console.log("owner OK")
    } else {
      setOwner("")
      console.log("owner KO")
    }
  }, [contractOwner]);

  return (
    <OwnerContext.Provider value={{ owner, setOwner, refetchOwner, ownerLoading }}>
      {children}
    </OwnerContext.Provider>
  );
};

export const useOwnerContext = () => useContext(OwnerContext);
