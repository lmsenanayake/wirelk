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
import Skeleton from '@mui/material/Skeleton';
import { useStablecoinContext } from "@/context/stablecoin";
import { useStakingContext } from "@/context/staking";

const StatsStakeLkrs = () => {

    const {
        stablecoinRupeeRate,
        stablecoinEthRate,
        fetchStableBalanceOf 
    } = useStablecoinContext();
    const { 
        dataStakingRupeeNumber,
        fetchStakingRupeeNumber
    } = useStakingContext();
    const [usdRate, setUsdRate] = useState(0);
    const [stakingData, setStakingData] = useState();

    const updateStakingData = () => {
        if (dataStakingRupeeNumber != undefined) {
            let staking = Number(dataStakingRupeeNumber)/1e18;
            let stakingUsd = staking / usdRate;
            setStakingData({
                balance : staking,
                balanceUsd: stakingUsd,
            })
        }
    }

    useEffect(() => {
        if (stablecoinRupeeRate != undefined) {
            let usdRate = Number(stablecoinRupeeRate)/1e18;
            setUsdRate(usdRate);
        }
        if (dataStakingRupeeNumber != undefined && usdRate != 0) {
            updateStakingData();
        }
    }, [stablecoinRupeeRate, dataStakingRupeeNumber, usdRate])

    return (
        <>
            <Grid item xs={12} md={6}>
                <Card sx={{ display: 'flex' }}>
                    <CardActionArea>
                        <CardMedia
                        component="img"
                        height="150"
                        image="https://www.bitcoin.com/static/ec96957fa34fcf43eec2ffd80a3abe40/14d1a/get-started-what-is-staking.webp"
                        alt="LKRS stablecoin staking"
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                LKRS staked amount
                            </Typography>
                            <Typography variant="h6">
                                { stakingData ? <>{stakingData.balance.toFixed(2)} LKRS</> : <Skeleton animation="wave"/> }
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                { stakingData ? <>{stakingData.balanceUsd.toFixed(2)} $</> : <Skeleton animation="wave"/> }
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Grid>
        </>
    )
}

export default StatsStakeLkrs