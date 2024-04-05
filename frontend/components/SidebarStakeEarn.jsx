"use client"
import React, { useState, useEffect } from "react";
import Typography from '@mui/material/Typography';
import Grid from "@mui/material/Grid";
import CardActionArea from "@mui/material/CardActionArea";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import CardActions from "@mui/material/CardActions";
import { LoadingButton } from '@mui/lab';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Skeleton from '@mui/material/Skeleton';
import { useStablecoinContext } from "@/context/stablecoin";
import { useStakingContext } from "@/context/staking";
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
import { publicClient } from '@/utils'

const SidebarStakeEarn = () => {

    const { address } = useAccount();
    const { stablecoinRupeeRate } = useStablecoinContext();
    const { dataStakingEarnings, fetchStakingEarnings } = useStakingContext();
    const [usdRate, setUsdRate] = useState(0);
    const [stakingData, setStakingData] = useState();
    const [stateSnack, setStateSnack] = useState({
        stat: false,
        type: "error",
        message: "Error occurred while processing your request",
    });

    const handleOpenSnack = (input) =>
        setStateSnack({
            stat: input.stat,
            type: input.type,
            message: input.message,
        });
    const handleCloseSnack = () =>
        setStateSnack({
            stat: false,
            type: stateSnack.type,
            message: stateSnack.message,
        });

    const fetchStakingData = async(proposalId) => {
        try {
            const data = await fetchStakingEarnings();
            let staking = Number(data)/1e18;
            let stakingUsd = staking / usdRate;
            setStakingData({
                balance : staking,
                balanceUsd: stakingUsd,
            });
        } catch (error) {
            handleOpenSnack({
                stat: true,
                type: "error",
                message: error.shortMessage,
            });
        }
    }

    const {data: hash1, isPending: isClaimPening, writeContract: claimRewards} = useWriteContract({
        mutation: {
            onSuccess: () => {
                fetchStakingData();
                handleOpenSnack({
                    stat: true,
                    type: "success",
                    message: "Rewards have been added to your balance.",
                });
            },
            onError: (error) => {
                handleOpenSnack({
                    stat: true,
                    type: "error",
                    message: error.shortMessage,
                });
            },
        },
    });

    const handleClaimReward = () => {
        if (stakingData.balance.toFixed(2) > 0.01) {
            claimRewards({
                address: stakingContractAddress,
                abi: stakingContractAbi,
                functionName: "claimReward",
                account: address
            });
        } else {
            handleOpenSnack({
                stat: true,
                type: "error",
                message: "Not enough rewards. Withdraw limit is set to 0.01 LKRS.",
            });
        }
    };

    useEffect(() => {
        const getStats = async() => {
            fetchStakingData();
        }
        if (stablecoinRupeeRate) {
            let usdRate = Number(stablecoinRupeeRate)/1e18;
            setUsdRate(usdRate);
        }
        if (usdRate != 0) {
            getStats()
        }
    }, [stablecoinRupeeRate, usdRate, dataStakingEarnings])

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
                            Earned rewards
                        </Typography>
                        <Typography variant="h6">
                            { stakingData ? <>{stakingData.balance.toFixed(5)} LKRS</> : <Skeleton animation="wave"/> }
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            { stakingData ? <>{stakingData.balanceUsd.toFixed(5)} $</> : <Skeleton animation="wave"/> }
                        </Typography>
                    </CardContent>
                    <CardActions disableSpacing sx={{
                        alignSelf: "stretch",
                        display: "flex",
                        justifyContent: "flex-end",
                        alignItems: "flex-start",
                        pt:1,
                        pb:2,
                        pr:2,
                    }}>
                        <LoadingButton
                            onClick={handleClaimReward}
                            loading={isClaimPening}
                            disabled={!stakingData ? 'disabled' : null}
                            variant="contained"
                            color="success"
                            size="medium"
                        >
                            <span>Claim</span>
                        </LoadingButton>
                    </CardActions>
                </CardActionArea>
            </Card>

            <Snackbar
                anchorOrigin={{ vertical: "top", horizontal: "center" }}
                open={stateSnack.stat}
                onClose={handleCloseSnack}
            >
                <Alert
                    onClose={handleCloseSnack}
                    severity={stateSnack.type}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                {stateSnack.message
                    ? stateSnack.message
                    : "Error occurred while processing your request"}
                </Alert>
            </Snackbar>
        </Grid>
    )
}

export default SidebarStakeEarn