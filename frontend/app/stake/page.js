"use client";
import React, { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import StatsStakeLkrs from "@/components/StatsStakeLkrs";
import StatsStakeEth from "@/components/StatsStakeEth";
import NotConnected from "@/components/NotConnected";
import SidebarStakeEarn from "@/components/SidebarStakeEarn";
import StakeRupee from "@/components/StakeRupee";
import StakeEth from "@/components/StakeEth";
import UnstakeRupee from "@/components/UnstakeRupee";
import UnstakeEth from "@/components/UnstakeEth";

const page = () => {

    const { address, isConnected } = useAccount();

    return (
        <>
            {isConnected ? (
                <>
                    <Grid container spacing={4}>
                        <StatsStakeLkrs />
                        <StatsStakeEth />
                    </Grid>
                    <Grid container spacing={5} sx={{ mt: 0 }}>
                        <Grid
                            item
                            xs={12}
                            md={8}
                            sx={{
                                '& .markdown': {
                                py: 3,
                                },
                                mb:5
                            }}
                        >
                            <Typography variant="h5" gutterBottom>
                                Earn interests with staking LKRS / ETH
                            </Typography>

                            <Divider />
                            <StakeRupee />
                            <StakeEth />
                            <UnstakeRupee />
                            <UnstakeEth />
                        </Grid>
                        <SidebarStakeEarn />
                    </Grid>
                </>
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