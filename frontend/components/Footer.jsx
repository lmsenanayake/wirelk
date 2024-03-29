"use client"
import * as React from 'react';
import Link from "next/link"
import { ConnectButton } from '@rainbow-me/rainbowkit'

// import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
// import Menu from '@mui/material/Menu';
// import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
// import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';

const Footer = (props) => {

    const { description, title } = props;

    return (
        <Box
          component="footer"
          sx={{
            py: 3,
            px: 2,
            mt: 'auto',
            backgroundColor: "#141B1D",
            borderTop: 3,
            borderColor: '#ccc'
          }}
        >
          <Container maxWidth="sm">
            <Typography variant="body1" align='center' sx={{color:"#ccc"}}>
              Your trusted worldwide money transfer & payment solutions
            </Typography>
            <Typography variant="body2" color="text.secondary" align='center' sx={{color:"#ddd"}}>
                {'Copyright © '}
                <Link color="inherit" href="#">
                    WIRELK Inc.
                </Link>{' '}
                {new Date().getFullYear()}
                {'.'}
            </Typography>
          </Container>
        </Box>
    )
}

export default Footer