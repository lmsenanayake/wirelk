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

const StatsBuyLkrs = () => {

    const { 
        stablecoinRupeeRate, 
        dataStableBalanceOf,
        fetchStableBalanceOf 
    } = useStablecoinContext();
    const [stableData, setStableData] = useState();
    // @TODO these variables can be removed when erros will be handle on top level
    // const [usdRate, setUsdRate] = useState(0);
    // const [error, setError] = useState("");
    // const [stateSnack, setStateSnack] = useState(false);
    // const handleOpenSnack = () => setStateSnack(true);
    // const handleCloseSnack = () => setStateSnack(false);

    const updateStableData = () => {
        if (dataStableBalanceOf) {
            let lkrsBalance = Number(dataStableBalanceOf)/1e18;
            let usdRate = Number(stablecoinRupeeRate)/1e18;
            let usdBalance = lkrsBalance / usdRate;
            setStableData({
                balance : lkrsBalance,
                balanceUsd: usdBalance,
            });
        }
    }

    useEffect(() => {
        if (dataStableBalanceOf) {
            updateStableData();
        }
    }, [dataStableBalanceOf])

    return (
        <>
            <Grid item xs={12} md={6}>
                <Card sx={{ display: 'flex' }}>
                    <CardActionArea>
                        <CardMedia
                        component="img"
                        height="150"
                        image="https://images.prismic.io/veriff/c2a7686e-a832-4f09-9e31-29ffafcf9b75_20-45_Crypto-wallet_Blog.png?auto=compress,format&rect=0,0,1920,1080&w=800&h=600"
                        alt="LKRS wallet"
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h5" component="div">
                               Your stablecoin balance
                            </Typography>
                            
                            <Typography variant="h6">
                                {stableData ? <>{stableData.balance.toFixed(4)} LKRS</> : <Skeleton animation="wave"/> }
                            </Typography>
                            
                            <Typography variant="body2" color="text.secondary">
                                {stableData ? <>{stableData.balanceUsd.toFixed(2)} $</> : <Skeleton animation="wave"/> }
                            </Typography>
                        </CardContent>
                    </CardActionArea>
                </Card>
            </Grid>

            {/* @TODO can be removed when erros will be handle on top level */}
            {/* <Snackbar 
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
            </Snackbar> */}
        </>
    )
}

export default StatsBuyLkrs