"use client"
import * as React from 'react';

import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';

const Sidebar = () => {
    return (
        <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.200' }}>
                <Typography variant="h5" gutterBottom>
                Cautions
                </Typography>
                <Typography>
                    Never Invest More than You Can Afford to Lose.
                    Cryptocurrencies are still relatively new and extremely 
                    volatile assets that can gain or lose significant value in a single day. 
                    While the long-term trend has been bullish, there is still skepticism and opportunism in these markets.
                </Typography>
            </Paper>
        </Grid>
    )
}

export default Sidebar