"use client"
import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';

const Header = () => {

  return (
<>
    <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Button size="small">Subscribe</Button>
        <Typography
          component="h2"
          variant="h4"
          color="inherit"
          align="center"
          noWrap
          sx={{ flex: 1 }}
        >
          WIRELK
        </Typography>
        <ConnectButton />
    </Toolbar>
</>
  )
}

export default Header