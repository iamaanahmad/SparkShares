'use client';

import React, { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

export const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const network = 'devnet';
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const SolanaConnectionProvider = ConnectionProvider as unknown as React.ComponentType<{
        endpoint: string;
    }>;
    const SolanaWalletProviderComponent = SolanaWalletProvider as unknown as React.ComponentType<{
        wallets: unknown[];
        autoConnect?: boolean;
        children?: ReactNode;
    }>;

    const wallets = useMemo(
        () => [], // Wallet Standard will automatically detect Phantom/Solflare
        []
    );

    return React.createElement(
        SolanaConnectionProvider,
        { endpoint },
        React.createElement(
            SolanaWalletProviderComponent,
            { wallets, autoConnect: true },
            React.createElement(WalletModalProvider, null, children)
        )
    );
};
