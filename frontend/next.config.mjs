/** @type {import('next').NextConfig} */
const nextConfig = {
    env: {
        WALLET_CONNECT_ID: process.env.WALLET_CONNECT_ID,
        CONTRACT_BLOCK_NUMBER: process.env.CONTRACT_BLOCK_NUMBER,
    }
};
export default nextConfig;
