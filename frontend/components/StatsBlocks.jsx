"use client"
import React, { useState, useEffect } from "react";
import Typography from '@mui/material/Typography';
import Grid from "@mui/material/Grid";
import CardActionArea from "@mui/material/CardActionArea";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Stack from "@mui/material/Stack";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { useAccount } from "wagmi";
import { stableContractAddress, stableContractAbi, stakingContractAddress, stakingContractAbi } from "@/constants";
import { publicClient } from '@/utils'

const StatsBlocks = () => {

    const { address } = useAccount();
    const [usdRate, setUsdRate] = useState(0);
    const [error, setError] = useState("");
    const [stateSnack, setStateSnack] = useState(false);
        const [stableData, setStableData] = useState({
        balance : 0,
        balanceUsd: 0,
    });
    const [stakingData, setStakingData] = useState({
        balance : 0,
        balanceUsd: 0,
    });
    const handleOpenSnack = () => setStateSnack(true);
    const handleCloseSnack = () => setStateSnack(false);

    const fetchStableData = async() => {
        try {
            let balance = await publicClient.readContract({
                address: stableContractAddress,
                abi: stableContractAbi,
                functionName: 'balanceOf',
                account: address,
                args: [address] 
            });
            let rate = await publicClient.readContract({
                address: stableContractAddress,
                abi: stableContractAbi,
                functionName: 'getUsdRupeeRate',
                account: address
            })
            let lkrsBalance = Number(balance)/1e18;
            let usdRate = Number(rate)/1e18;
            let usdBalance = lkrsBalance / usdRate;
            setUsdRate(usdRate);
            setStableData({
                balance : lkrsBalance,
                balanceUsd: usdBalance,
            });
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
                account: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
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
        const getStats = async() => {
            fetchStakingData();
        }
        getStats()
    }, [usdRate])

    return (
        <>
            <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                    <CardActionArea component="a" href="#">
                        <Card sx={{ display: 'flex' }}>
                        <CardContent sx={{ flex: 1 }}>
                            <Typography component="h2" variant="h4" gutterBottom>
                            Your balance
                            </Typography>
                            <Typography component="h3" variant="h5">
                            {stableData ? stableData.balance.toFixed(2) : 0 } LKRS
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {stableData ? stableData.balanceUsd.toFixed(2) : 0 } $
                            </Typography>
                            <Typography variant="subtitle1" color="primary">
                            Buy more
                            </Typography>
                        </CardContent>
                        <CardMedia
                            component="img"
                            sx={{ width: 180, display: { xs: 'none', sm: 'block' } }}
                            image="https://www.bitcoin.com/static/1cf0d491c07de50827569913d37af2ef/14d1a/get-started-shared-multisig-bitcoin-wallet.webp"
                            alt={"post.imageLabel"}
                        />
                        </Card>
                    </CardActionArea>
                </Grid>
                <Grid item xs={12} md={6}>
                    <CardActionArea component="a" href="#">
                        <Card sx={{ display: 'flex' }}>
                        <CardContent sx={{ flex: 1 }}>
                            <Typography component="h2" variant="h4" gutterBottom>
                            Staked amount
                            </Typography>
                            <Typography component="h3" variant="h5">
                            {stakingData ? stakingData.balance.toFixed(2) : 0 } LKRS
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {stakingData ? stakingData.balanceUsd.toFixed(2) : 0 } $
                            </Typography>
                            <Typography variant="subtitle1" color="primary">
                            Stake more
                            </Typography>
                        </CardContent>
                        <CardMedia
                            component="img"
                            sx={{ width: 180, display: { xs: 'none', sm: 'block' } }}
                            image="https://academy-public.coinmarketcap.com/optimized-uploads/e6f29815ad074e2fbcd7d0aa3706f2cf.png"
                            alt={"post.imageLabel"}
                        />
                        </Card>
                    </CardActionArea>
                </Grid>
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

export default StatsBlocks