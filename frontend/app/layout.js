import { AppRouterCacheProvider } from "@mui/material-nextjs/v13-appRouter";
import RainbowKitProviderImport from "@/components/RainbowKitProviderImport";
import { Inter } from "next/font/google";

import Layout from "@/components/Layout";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "WIRELK Inc. producer of LKRS",
  description: "Now you are able to buy the first sablecoin for Sri Lankan Rupee",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <RainbowKitProviderImport>
            <AppRouterCacheProvider>
                <Layout>
                    {children}
                </Layout>
            </AppRouterCacheProvider>
        </RainbowKitProviderImport>   
      </body>
    </html>
  );
}
