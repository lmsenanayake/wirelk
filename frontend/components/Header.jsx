"use client"
import * as React from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit'
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Link from '@mui/material/Link';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import XIcon from '@mui/icons-material/X';

const Header = () => {

  return (
<>
    <Toolbar sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Stack direction="row" spacing={1} alignItems="center"  sx={{ mr: 2 }}>
            <GitHubIcon />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 2 }}>
            <FacebookIcon />
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center" sx={{ mr: 1 }}>
            <XIcon />
        </Stack>
        <Typography
          component="h2"
          variant="h4"
          color="inherit"
          align="center"
            fontWeight="bold"
          noWrap
          sx={{ flex: 1 }}
        >
          WIRE<span style={{
                color: "#fff",
                backgroundColor:"#000"
                }}>LK</span>
        </Typography>
        <ConnectButton />
    </Toolbar>
</>
  )
}

export default Header