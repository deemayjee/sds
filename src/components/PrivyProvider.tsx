'use client';

import { PrivyProvider } from '@privy-io/react-auth';
import { ReactNode } from 'react';
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana"

interface PrivyWrapperProps {
  children: ReactNode;
}

export default function PrivyWrapper({ children }: PrivyWrapperProps) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID || ''}
      clientId={process.env.NEXT_PUBLIC_PRIVY_CLIENT_ID || ''}
      config={{
        appearance: {
            accentColor: "#6A6FF5",
            showWalletLoginFirst: true,
            logo: "https://auth.privy.io/logos/privy-logo.png",
            walletChainType: "solana-only",
            walletList: [
              "phantom",
              "solflare",
              "backpack",
            ]
        },
        loginMethods: ["wallet"],
        embeddedWallets: {
          requireUserPasswordOnCreate: false,
          showWalletUIs: false,
          ethereum: {
            createOnLogin: "off"
          },
          solana: {
            createOnLogin: "off"
          }
        },
        mfa: {
          noPromptOnMfaRequired: false
        },
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors()
          }
        }
      }}
    >
      {children}
    </PrivyProvider>
  );
} 