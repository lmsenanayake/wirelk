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
import { contractAddress, contractAbi } from "@/constants";
import { publicClient } from '@/utils'

const StatsBlocks = () => {

    const { address } = useAccount();
    const [stablecoinData, setStablecoinData] = useState({});
    const [error, setError] = useState("");
    const [stateSnack, setStateSnack] = useState(false);
    const handleOpenSnack = () => setStateSnack(true);
    const handleCloseSnack = () => setStateSnack(false);

    // const fetchProposal = async(proposalId) => {
    //     const data = await publicClient.readContract({
    //         address: stableContractAddress,
    //         abi: stableContractAbi,
    //         functionName: 'name',
    //         account: address,
    //         args: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"] 
    //     })
    //     // setProposalData({
    //     //     id : proposalId,
    //     //     description: data.description,
    //     //     voteCount: data.voteCount
    //     // })
    //     console.log(data)
    // }

    const fetchUserBalance = async() => {
        try {
            let balance = await publicClient.readContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'balanceOf',
                account: address,
                args: ["0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"] 
            })
            let rate = await publicClient.readContract({
                address: contractAddress,
                abi: contractAbi,
                functionName: 'getUsdRupeeRate',
                account: address
            })
            //await fetchProposal(data)
            setStablecoinData({
                balance : balance,
                usdRate: rate,
            })
        } catch (error) {
            setError(error.message)
            handleOpenSnack()
        }
    }

    useEffect(() => {
        const getAllEvents = async() => {
            fetchUserBalance()
        }
        getAllEvents()
    }, [])

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
                            {stablecoinData ? Number(stablecoinData.balance) : 0 } LKRS
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            {stablecoinData ? (Number(stablecoinData.balance)/(Number(stablecoinData.usdRate)/1e18)) : 0 } $
                            </Typography>
                            <Typography variant="subtitle1" color="primary">
                            Buy more
                            </Typography>
                        </CardContent>
                        <CardMedia
                            component="img"
                            sx={{ width: 160, display: { xs: 'none', sm: 'block' } }}
                            image="https://source.unsplash.com/random?wallpapers"
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
                            185000 LKRS
                            </Typography>
                            <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                            616 $
                            </Typography>
                            <Typography variant="subtitle1" color="primary">
                            Stake more
                            </Typography>
                        </CardContent>
                        <CardMedia
                            component="img"
                            sx={{ width: 160, display: { xs: 'none', sm: 'block' } }}
                            image="https://source.unsplash.com/random?wallpapers"
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