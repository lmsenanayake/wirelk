"use client"
import React, { useState, useEffect } from "react";
import Typography from '@mui/material/Typography';
import Grid from "@mui/material/Grid";
import CardActionArea from "@mui/material/CardActionArea";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Skeleton from '@mui/material/Skeleton';
import { useStablecoinContext } from "@/context/stablecoin";
import { useStakingContext } from "@/context/staking";

const StatsStakeLKRS = () => {

    const { stablecoinEthRate } = useStablecoinContext();
    const { dataStakingEthNumber } = useStakingContext();
    const [usdRate, setUsdRate] = useState(0);
    const [stakingData, setStakingData] = useState();

    const updateStakingData = () => {
        if (dataStakingEthNumber != undefined) {
            let staking = Number(dataStakingEthNumber)/1e18;
            let stakingUsd = staking * usdRate;
            setStakingData({
                balance : staking,
                balanceUsd: stakingUsd,
            });
        }
    }

    useEffect(() => {
        if (stablecoinEthRate != undefined) {
            let usdRate = Number(stablecoinEthRate)/1e18;
            setUsdRate(usdRate);
        }
        if (dataStakingEthNumber != undefined && usdRate != 0) {
            updateStakingData();
        }
    }, [stablecoinEthRate, dataStakingEthNumber, usdRate]);

    return (
        <>
            <Grid item xs={12} md={6}>
                <Card sx={{ display: 'flex' }}>
                    <CardActionArea>
                        <CardMedia
                        component="img"
                        height="150"
                        image="https://www.lemediadelinvestisseur.fr/content/images/size/w768/format/webp/2024/01/staking_eth-1-1.png"
                        alt="ETH staking"
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                                ETH staked amount
                            </Typography>
                            <Typography variant="h6">
                                { stakingData ? <>{stakingData.balance.toFixed(10)} ETH</> : <Skeleton animation="wave"/> }
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

export default StatsStakeLKRS