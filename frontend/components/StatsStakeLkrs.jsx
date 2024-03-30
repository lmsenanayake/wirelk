"use client"
import React, { useState, useEffect } from "react";
import Typography from '@mui/material/Typography';
import Grid from "@mui/material/Grid";
import CardActionArea from "@mui/material/CardActionArea";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { useAccount } from "wagmi";
import { stableContractAddress, stableContractAbi, stakingContractAddress, stakingContractAbi } from "@/constants";
import { publicClient } from '@/utils'

const StatsStakeLkrs = () => {

    const { address } = useAccount();
    const [usdRate, setUsdRate] = useState(0);
    const [error, setError] = useState("");
    const [stateSnack, setStateSnack] = useState(false);
    const [stakingData, setStakingData] = useState({
        balance : 0,
        balanceUsd: 0,
    });
    const handleOpenSnack = () => setStateSnack(true);
    const handleCloseSnack = () => setStateSnack(false);

    const fetchStableData = async() => {
        try {
            let rate = await publicClient.readContract({
                address: stableContractAddress,
                abi: stableContractAbi,
                functionName: 'getUsdRupeeRate',
                account: address
            })
            let usdRate = Number(rate)/1e18;
            setUsdRate(usdRate);
        } catch (error) {
            setError(error.message)
            handleOpenSnack()
        }
    }

    const fetchStakingData = async(proposalId) => {
        try {
            const data = await publicClient.readContract({
                address: stakingContractAddress,
                abi: stakingContractAbi,
                functionName: 'getStakedRupeeNumber',
                account: address,
                //args: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"] 
            });
            let staking = Number(data)/1e18;
            let stakingUsd = staking / usdRate;
            setStakingData({
                balance : staking,
                balanceUsd: stakingUsd,
            })
        } catch (error) {
            setError(error.message)
            handleOpenSnack()
        }
    }

    useEffect(() => {
        const getStats = async() => {
            fetchStableData();
        }
        getStats()
    }, [])

    useEffect(() => {
        if (usdRate != 0) {
            const getStats = async() => {
                fetchStakingData();
            }
            getStats()
        }
    }, [usdRate])

    return (
        <>
            <Grid item xs={12} md={6}>
                <Card sx={{ display: 'flex' }}>
                    <CardActionArea>
                        <CardMedia
                        component="img"
                        height="170"
                        image="https://www.bitcoin.com/static/ec96957fa34fcf43eec2ffd80a3abe40/14d1a/get-started-what-is-staking.webp"
                        alt="LKRS stablecoin staking"
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                LKRS staked amount
                            </Typography>
                            <Typography variant="h6">
                                {stakingData ? stakingData.balance.toFixed(2) : 0 } LKRS
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {stakingData ? stakingData.balanceUsd.toFixed(2) : 0 } $
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Grid>

            <Snackbar 
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                open={stateSnack} 
                onClose={handleCloseSnack}
            >
                <Alert
                    onClose={handleCloseSnack}
                    severity="error"
                    variant="filled"
                    sx={{ width: '100%' }}
                >
                    {error ? error : "Error occurred while processing your request !"}
                </Alert>
            </Snackbar>
        </>
    )
}

export default StatsStakeLkrs