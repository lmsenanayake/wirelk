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
import { useStablecoinContext } from "@/context/stablecoin";
import { publicClient } from '@/utils';
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


const StatsBuyLkrs = () => {

    const { address } = useAccount();
    const { stablecoinRupeeRate, dataStableBalanceOf, fetchStableBalanceOf } = useStablecoinContext();
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
        let lkrsBalance = Number(dataStableBalanceOf)/1e18;
        let usdRate = Number(stablecoinRupeeRate)/1e18;
        let usdBalance = lkrsBalance / usdRate;
        setUsdRate(usdRate);
        setStableData({
            balance : lkrsBalance,
            balanceUsd: usdBalance,
        });
    }

    useEffect(() => {
        const getStats = async() => {
            fetchStableData();
        }
        if (dataStableBalanceOf) {
            getStats()
        }
    }, [dataStableBalanceOf])

    return (
        <>
            <Grid item xs={12} md={6}>
                <Card sx={{ display: 'flex' }}>
                    <CardActionArea>
                        <CardMedia
                        component="img"
                        height="170"
                        image="https://images.prismic.io/veriff/c2a7686e-a832-4f09-9e31-29ffafcf9b75_20-45_Crypto-wallet_Blog.png?auto=compress,format&rect=0,0,1920,1080&w=800&h=600"
                        alt="LKRS wallet"
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                Your stablecoin balance
                            </Typography>
                            <Typography variant="h6">
                                {stableData ? stableData.balance.toFixed(4) : 0 } LKRS
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {stableData ? stableData.balanceUsd.toFixed(2) : 0 } $
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

export default StatsBuyLkrs