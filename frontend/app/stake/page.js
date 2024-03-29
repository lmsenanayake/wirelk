"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Grid from "@mui/material/Grid";
import StatsBlocks from "../../components/StatsBlocks";
import NotConnected from "../../components/NotConnected";
import Sidebar from "../../components/Sidebar";
import Buy from "../../components/Buy";


const stake = () => {

    const { address, isConnected } = useAccount();

    return (
        <>
        {isConnected ? (
            <>
                <StatsBlocks />
                <Grid container spacing={5} sx={{ mt: 0 }}>
                    <Buy />
                    <Sidebar />
                </Grid>
            </>
        ) : (
            <NotConnected />
        )}
        </>
    )
}

export default stake