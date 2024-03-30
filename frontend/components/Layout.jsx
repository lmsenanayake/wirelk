"use client";
import React, { useState, useEffect } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Grid from "@mui/material/Grid";
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Header from "./Header";
import Menu from "./Menu";
import Footer from "./Footer";
import MainFeatured from "./MainFeatured";


import { useOwnerContext } from "@/context/owner";
import { useAccount } from "wagmi";

//Importation des composants
import NotConnected from "@/components/NotConnected";

const Layout = ({ children }) => {
    const { address, isConnected } = useAccount();
    const defaultTheme = createTheme();
//   const { owner, refetchOwner } = useOwnerContext();

//   useEffect(() => {
//     if (isConnected) {
//       refetchOwner();
//     }
//     // alert(owner);
//   }, [isConnected]);

const sections = [
  { title: 'Home', url: '/' },
  { title: 'Buy LKRS', url: '/buy' },
  { title: 'Staking LKRS', url: '/stake' },
  { title: 'About', url: '#' },
  { title: 'Contact', url: '#' },
];

  return (
<>  
    <ThemeProvider theme={defaultTheme}>
        <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
        >
            <CssBaseline />
            <Header />
            <Container >
            <Menu  sections={sections} />
            <main>
                { children }
            </main>
            </Container>
            <Footer />
        </Box>
    </ThemeProvider>





</>
  );
};

export default Layout;
