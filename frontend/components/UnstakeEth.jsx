"use client"
import React, { useState, useEffect } from "react";
import Grid from "@mui/material/Grid";
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { LoadingButton } from '@mui/lab';
import TextField from "@mui/material/TextField";
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContentText from '@mui/material/DialogContentText';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import { parseEther } from 'viem'
import {
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useReadContract,
} from "wagmi";

import { stableContractAddress, stableContractAbi, stakingContractAddress, stakingContractAbi } from "@/constants";
import { publicClient } from "@/utils";

const UnstakeEth = () => {

    const { address } = useAccount();
    const [amount, setAmount] = useState();
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

    const {data: hash1, isPending: unstakeIsPending, writeContract: unstakeCoins} = useWriteContract({
        mutation: {
            onSuccess: () => {
                setAmount(0);
                handleOpenSnack({
                    stat: true,
                    type: "success",
                    message: "Your transaction has been processed successfully.",
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

    const handleUnstaking = async () => {
        if (amount && amount != 0) {
            unstakeCoins({
                address: stakingContractAddress,
                abi: stakingContractAbi,
                functionName: "withdrawEth",
                account: address,
                args: [parseEther(amount.toString())]
            });
        } else {
            handleOpenSnack({
                stat: true,
                type: "error",
                message: "Please fill the amount of Ethers to unstake.",
            });
        }
    };


    return (
        <>
            <Stack direction="row" spacing={2} sx={{mt:5}}>
                <FormControl sx={{ m: 1, minWidth: 200 }}>
                <TextField 
                    id="outlined-basic"
                    label="Ethers amount"
                    variant="outlined"
                    value={amount}
                    onChange={(event) => {
                        setAmount(Number(event.target.value));
                    }}
                />
                </FormControl>
                <LoadingButton
                    onClick={handleUnstaking}
                    loading={unstakeIsPending}
                    variant="contained"
                    color="error"
                >
                    <span>OUT</span>
                </LoadingButton>

                <Alert
                    severity="info"
                    sx={{ width: "100%" }}
                    color="warning"
                >
                    You will not earn any reward after withdrawing Ethers.
                </Alert>
            </Stack>

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

export default UnstakeEth