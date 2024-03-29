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
// import Tooltip from '@mui/material/Tooltip';
// import MenuItem from '@mui/material/MenuItem';
// import HowToVoteIcon from '@mui/icons-material/HowToVote';

const Menu = (props) => {

    const { sections } = props;

    return (
        <Toolbar
        component="nav"
        variant="dense"
        sx={{ justifyContent: 'space-between', overflowX: 'auto' }}
        >
        {sections.map((section) => (
            <Link
            color="inherit"
            noWrap
            key={section.title}
            variant="body2"
            href={section.url}
            sx={{ p: 1, flexShrink: 0 }}
            >
            {section.title}
            </Link>
        ))}
        </Toolbar>
    )
}

export default Menu