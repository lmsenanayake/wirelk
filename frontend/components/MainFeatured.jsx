"use client"
import * as React from 'react';
import Link from "next/link"
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Grid from '@mui/material/Grid';

const MainFeatured = (props) => {

    const { post } = props;

    return (
        <Paper
            sx={{
            position: 'relative',
            backgroundColor: 'grey.800',
            color: '#fff',
            mb: 4,
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            backgroundImage: `url(${post.image})`,
            }}
        >
            {/* Increase the priority of the hero background image */}
            {<img style={{ display: 'none' }} src={post.image} alt={post.imageText} />}
            <Box
            sx={{
                position: 'absolute',
                top: 0,
                bottom: 0,
                right: 0,
                left: 0,
                backgroundColor: 'rgba(0,0,0,.3)',
            }}
            />
            <Grid container>
            <Grid item md={6}>
                <Box
                sx={{
                    position: 'relative',
                    p: { xs: 3, md: 6 },
                    pr: { md: 0 },
                }}
                >
                <Typography component="h1" variant="h3" color="inherit" gutterBottom>
                    {post.title}
                </Typography>
                <Typography variant="h5" color="inherit" paragraph>
                    {post.description}
                </Typography>
                <Link variant="subtitle1" href={post.link}>
                    {post.linkText}
                </Link>
                </Box>
            </Grid>
            </Grid>
        </Paper>
    );
}

export default MainFeatured