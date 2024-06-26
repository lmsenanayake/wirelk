"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Grid from "@mui/material/Grid";
import StatsBuyLkrs from "@/components/StatsBuyLkrs";
import StatsStakeLkrs from "@/components/StatsStakeLkrs";
import NotConnected from "@/components/NotConnected";
import Sidebar from "@/components/Sidebar";
import Buy from "@/components/Buy";
 import { StablecoinContextProvider } from "@/context/stablecoin";
 import { StakingContextProvider } from "@/context/staking";


const page = () => {

    const { address, isConnected } = useAccount();

    return (
        <>
            {isConnected ? (
                <StablecoinContextProvider>
                    <StakingContextProvider>
                        <Grid container spacing={4}>
                            <StatsBuyLkrs />
                            <StatsStakeLkrs />
                        </Grid>
                        <Grid container spacing={5} sx={{ mt: 0 }}>
                            <Buy />
                            <Sidebar />
                        </Grid>
                    </StakingContextProvider>
                </StablecoinContextProvider>
            ) : (
                <>
                    <div style={{marginBottom: 30}} />
                    <NotConnected />
                </>
            )}
        </>
    )
}

export default page