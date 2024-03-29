"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import StatsBlocks from "../../components/StatsBlocks";
import NotConnected from "../../components/NotConnected";

const buy = () => {

    const { address, isConnected } = useAccount();

    return (
        <>
            {isConnected ? (
                <StatsBlocks />
            ) : (
                <NotConnected />
            )}
        </>
    )
}

export default buy