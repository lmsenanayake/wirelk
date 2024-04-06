"use client"
import React, { useState, useEffect } from "react";
import FormControl from '@mui/material/FormControl';
import Stack from '@mui/material/Stack';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { LoadingButton } from '@mui/lab';
import TextField from "@mui/material/TextField";
import { parseEther } from 'viem';
import { useStakingContext } from "@/context/staking";
import { useStablecoinContext } from "@/context/stablecoin";
import { publicClient } from "@/utils";
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

const UnstakeRupee = () => {

    const { address } = useAccount();
    const {         
        dataStakingRupeeNumber,
        dataStakingEthNumber,
        dataStakingEarnings,
        fetchStakingRupeeNumber,
        fetchStakingEthNumber,
        fetchStakingEarnings
    } = useStakingContext();
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
                setAmount("");
                handleOpenSnack({
                    stat: true,
                    type: "success",
                    message: "Your transaction has been sent successfully.",
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

    const handleUnstake = async () => {
        if (amount && amount != 0) {
            unstakeCoins({
                address: stakingContractAddress,
                abi: stakingContractAbi,
                functionName: "withdrawRupee",
                account: address,
                args: [parseEther(amount.toString())],
            });
        } else {
            handleOpenSnack({
                stat: true,
                type: "error",
                message: "Please fill the number of LKRS tokens to unstake.",
            });
        }
    };

    const checkTransactionReceipt = async (hash) => {
        const transaction = await publicClient.waitForTransactionReceipt({ hash });
        if (transaction) {
            refreshDataOnTxConfirmation();
        }
    }

    const refreshDataOnTxConfirmation = () => {
        fetchStakingRupeeNumber();
        fetchStakingEarnings();
        handleOpenSnack({
            stat: true,
            type: "success",
            message: "Your transaction has been successfully processed",
        });
    }

    useEffect(() => {
        if (hash1 != undefined) {
            const callEvent = async () => {
                checkTransactionReceipt(hash1);
            };
            callEvent();
        }
    }, [hash1]);


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
                        setAmount(event.target.value);
                    }}
                />
                </FormControl>
                <LoadingButton
                    onClick={handleUnstake}
                    loading={unstakeIsPending}
                    disabled={!dataStakingRupeeNumber ? 'disabled' : null}
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
                    You will not earn any reward after withdrawing LKRS.
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

export default UnstakeRupee