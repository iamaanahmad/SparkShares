'use client';

import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const network = 'devnet';
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new SolflareWalletAdapter(),
        ],
        []
    );

    return (
        // @ts-expect-error - Ignore React 18 children type mismatch with Solana wallet adapters
        <ConnectionProvider endpoint={endpoint}>
            {/* @ts-expect-error - Expected wallet mismatch */}
            <SolanaWalletProvider wallets={wallets} autoConnect>
                {/* @ts-expect-error - Expected children mismatch */}
                <WalletModalProvider>{children}</WalletModalProvider>
            </SolanaWalletProvider>
        </ConnectionProvider>
    );
};
