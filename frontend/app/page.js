import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MainFeatured from "../components/MainFeatured";

const mainFeaturedPost = {
  title: 'First stablecoin for Sri Lankan Rupee (LKRS)',
  description:
    "Wirelk team is glad to announce you that we were able to create the first stablecoin for the Sri Lankan Rupee using the blockchain technology. Available in 2025 on Polygon.",
  image: 'https://source.unsplash.com/random?wallpapers',
  imageText: 'main image description',
  link: '/buy',
  linkText: 'Continue reading…',
};

export default function Home() {
    return (
        <>
            <MainFeatured post={mainFeaturedPost} />
            <Container sx={{ mb: 2 }} maxWidth="sm">
                <Typography variant="h2" component="h1" gutterBottom align="center">
                    Wirelk Vision
                </Typography>
                <Typography variant="h5" component="h2" gutterBottom align="center">
                    {'Our online payment solutions and money transfer service '}
                    {'will provide you the best at a lower cost'}
                </Typography>
                <Typography sx={{ mt: 2 }} variant="body1" align="center">Secure your money is our ultimate goal.</Typography>
            </Container>
        </>
    );
}