"use client"
import React, { useState, useEffect } from "react";
import Typography from '@mui/material/Typography';
import Grid from "@mui/material/Grid";
import CardActionArea from "@mui/material/CardActionArea";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

import { useAccount } from "wagmi";
import { stableContractAddress, stableContractAbi, stakingContractAddress, stakingContractAbi } from "@/constants";
import { publicClient } from '@/utils'

const SidebarStakeEarn = () => {

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
                functionName: 'earned',
                account: address,
                args: [address] 
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
    }, [usdRate]);

    return (
        <Grid item xs={12} md={4}>
            <Card sx={{ display: 'flex' }}>
                <CardActionArea component="a" href="#">
                    <CardMedia
                    component="img"
                    height="180"
                    image="https://www.forbesindia.com/media/images/2022/Jul/img_188883_gtabg.jpg"
                    alt="ETH staking"
                    />
                    <CardContent sx={{pb:0}}>
                        <Typography gutterBottom variant="h5" component="div">
                            Earned tokens
                        </Typography>
                        <Typography variant="h6">
                            {stakingData ? stakingData.balance.toFixed(2) : 0 } LKRS
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {stakingData ? stakingData.balanceUsd.toFixed(2) : 0 } $
                        </Typography>
                    </CardContent>
                    <CardActions disableSpacing sx={{
                        alignSelf: "stretch",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "flex-start",
                        pt:0,
                        pb:2,
                        pr:2,
                    }}>
                        <Button size="large" variant="contained" color="success" >Claim </Button>
                    </CardActions>
                </CardActionArea>
            </Card>

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
        </Grid>
    )
}

export default SidebarStakeEarn