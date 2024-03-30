import Alert from '@mui/material/Alert';

const NotConnected = (props) => {

    return (
        <Alert severity="warning">
            In order to use this onchain feature you must be logged-in. Please connect your Wallet.
        </Alert>
    );
};

export default NotConnected;
