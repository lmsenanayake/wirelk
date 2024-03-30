"use client"
import React, { useState, useEffect } from "react";
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

const StakeRupee = () => {

    const { address } = useAccount();
    const [amount, setAmount] = useState();
    const [isGlobalPending, setIsGlobalPending] = useState(false);
    const [isApproved, setIsApproved] = useState(false);
    const [ethCost, setEthCost] = useState(0);
    const [stateDialog, setStateDialog] = useState(0);
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
    const handleOpenDialog = () => {
        setStateDialog(true);
    };
    const handleCloseDialog = () => {
        setStateDialog(false);
    };
    const handleClickStakeButton = () => {
        if (amount && amount != 0) {
            setStateDialog(true);
        } else {
            handleOpenSnack({
                stat: true,
                type: "error",
                message: "Please fill the number of LKRS tokens to stake.",
            });
        }
    };

    const {data, isPending, writeContract: delegateApprove} = useWriteContract({
        mutation: {
            onSuccess: () => {
                setIsApproved(true);
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

    const {data: hash1, isPending: stakeIsPending, writeContract: stakeStablecoin} = useWriteContract({
        mutation: {
            onSuccess: () => {
                setAmount(0);
                setIsGlobalPending(false);
                handleOpenSnack({
                    stat: true,
                    type: "success",
                    message: "Your transaction has been processed successfully.",
                });
            },
            onError: (error) => {
                setIsGlobalPending(false);
                handleOpenSnack({
                    stat: true,
                    type: "error",
                    message: error.shortMessage,
                });
            },
        },
    });

    const handleStakeAndApprove = async () => {
        if (amount && amount != 0) {
            setIsGlobalPending(true);
            delegateApprove({
                address: stableContractAddress,
                abi: stableContractAbi,
                functionName: "approve",
                account: address,
                args: [stakingContractAddress, parseEther(amount.toString())],
                // value: parseEther(ethCost.toString())
            });
            handleCloseDialog();
        } else {
            handleOpenSnack({
                stat: true,
                type: "error",
                message: "Please fill the number of LKRS tokens to stake.",
            });
        }
    };

    useEffect(() => {
        const getAllEvents = async () => {

            if (isApproved) {
                stakeStablecoin({
                    address: stakingContractAddress,
                    abi: stakingContractAbi,
                    functionName: "stakeRupee",
                    account: address,
                    args: [parseEther(amount.toString())],
                    // value: parseEther(ethCost.toString())
                });
            }
        };
        getAllEvents();
    }, [isApproved]);


    return (
        <>
            <Stack direction="row" spacing={2} sx={{mt:5}}>
                <FormControl sx={{ m: 1, minWidth: 200 }}>
                <TextField 
                    id="outlined-basic"
                    label="LKRS token number"
                    variant="outlined"
                    value={amount}
                    onChange={(event) => {
                        setAmount(Number(event.target.value));
                    }}
                />
                </FormControl>
                <LoadingButton
                    onClick={handleClickStakeButton}
                    loading={isGlobalPending}
                    variant="contained"
                >
                    <span>Stake</span>
                </LoadingButton>

                <Alert
                    severity="info"
                    sx={{ width: "100%" }}
                >
                    You can earn upto <b>50 LKRS</b> per day by staking them.
                </Alert>
            </Stack>
            
            <Dialog
                open={stateDialog}
                onClose={handleCloseDialog}
                aria-labelledby="alert-dialog-title"
                aria-describedby="alert-dialog-description"
            >
                <DialogTitle id="alert-dialog-title">
                Stake LKRS tokens to earn rewards
                </DialogTitle>
                <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    Before staking LKRS tokens on our system, you have to approve with your wallet that 
                    our system will be able to transfer your tokens into our vault.
                </DialogContentText>
                </DialogContent>
                <DialogActions>
                <Button onClick={handleCloseDialog}>Disagree</Button>
                <Button onClick={handleStakeAndApprove} autoFocus>
                    Agree
                </Button>
                </DialogActions>
            </Dialog>

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

export default StakeRupee