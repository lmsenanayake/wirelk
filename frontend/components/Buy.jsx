"use client"
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { LoadingButton } from '@mui/lab';
import Paper from "@mui/material/Paper";
import { parseEther } from 'viem'
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
import { useStablecoinContext } from "@/context/stablecoin";
import { publicClient } from "@/utils";

const Buy = () => {

    const { address } = useAccount();
    const { 
        stablecoinRupeeRate,
        stablecoinEthRate,
        fetchStableBalanceOf 
    } = useStablecoinContext();
    const [amount, setAmount] = useState(0);
    const [ethUsdRate, setEthUsdRate] = useState(0);
    const [lkrUsdRate, setLkrUsdRate] = useState(0);
    const [ethCost, setEthCost] = useState(0);
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
    const handleChange = (event) => {
        let amount = Number(event.target.value);
        setAmount(amount);

        let lkrsAmountUsd = amount / lkrUsdRate;
        let ethCost =  lkrsAmountUsd / ethUsdRate;
        setEthCost(ethCost);
    };

    const {data: hash1, isPending, writeContract: callBuy} = useWriteContract({
        mutation: {
            onSuccess: () => {
                //fetchStableBalanceOf();
                handleOpenSnack({
                    stat: true,
                    type: "success",
                    message: "Your transaction successfully set to be processed",
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

    const {
        isLoading: isConfirming,
        isSuccess: isConfirmed,
        error: errorConfirmation,
    } = useWaitForTransactionReceipt({
        hash1,
    });

    const setLKRSAmount = async () => {
        if (ethCost != 0) {
            callBuy({
                address: stableContractAddress,
                abi: stableContractAbi,
                functionName: "buy",
                account: address,
                value: parseEther(ethCost.toString())
            });
        } else {
            handleOpenSnack({
                stat: true,
                type: "error",
                message: "Please select the LKRS token amount.",
            });
        }
    };

    const updateStableData = async() => {
        let eth = Number(stablecoinEthRate)/1e18;
        let lkr = Number(stablecoinRupeeRate)/1e18;
        setEthUsdRate(eth);
        setLkrUsdRate(lkr);
    }

    useEffect(() => {
        if (stablecoinEthRate && stablecoinEthRate != undefined) {
            const getAllEvents = async () => {
                updateStableData();
            };
            getAllEvents();
        }
// console.info(stablecoinEthRate);
console.info('isConfirmed', isConfirmed);
console.info('isConfirming', isConfirming);
        if (isConfirmed) {
            fetchStableBalanceOf();
            handleOpenSnack({
                stat: true,
                type: "success",
                message: "Your transaction has been successfully processed",
            });
        }
    }, [stablecoinEthRate, isConfirmed, isConfirming]);


    return (
        <>
            
                <Grid
                item
                xs={12}
                md={8}
                sx={{
                    '& .markdown': {
                    py: 3,
                    },
                }}
                >
                    <Typography variant="h5" gutterBottom>
                        Buy stablecoins with your Ethers
                    </Typography>

                    <Divider />

                    <Stack direction="row" spacing={2} sx={{mt:5}}>
                        <FormControl sx={{ m: 1, minWidth: 200 }}>
                        <InputLabel id="demo-simple-select-helper-label">
                            LKRS token number
                        </InputLabel>
                        <Select
                            labelId="demo-simple-select-helper-label"
                            id="demo-simple-select-helper"
                            value={amount}
                            label="LKRS token amount"
                            onChange={handleChange}
                        >
                            <MenuItem value="1000" key="1000">
                                1000 LKRS
                            </MenuItem>
                            <MenuItem value="10000" key="10000">
                                10000 LKRS
                            </MenuItem>
                            <MenuItem value="50000" key="50000">
                                50000 LKRS
                            </MenuItem>
                            <MenuItem value="100000" key="100000">
                                100000 LKRS
                            </MenuItem>
                            <MenuItem value="200000" key="200000">
                                200000 LKRS
                            </MenuItem>
                            <MenuItem value="300000" key="300000">
                                300000 LKRS
                            </MenuItem>
                            <MenuItem value="500000" key="500000">
                                500000 LKRS
                            </MenuItem>
                            <MenuItem value="1000000" key="1000000">
                                1000000 LKRS
                            </MenuItem>
                        </Select>
                        </FormControl>
                        <LoadingButton
                            onClick={setLKRSAmount}
                            loading={isPending}
                            variant="contained"
                        >
                            <span>BUY</span>
                        </LoadingButton>

                        <Alert
                            severity="info"
                            sx={{ width: "100%" }}
                        >
                            You will be charged &#8776; <b>{ethCost ? ethCost.toFixed(10) : 0 } ETH</b> for this purchase.
                        </Alert>
                    </Stack>
                </Grid>
                
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
        </>
    )
}

export default Buy