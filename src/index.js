import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AbstractWalletProvider } from '@abstract-foundation/agw-react';
import { abstract } from 'viem/chains';
import { WagmiProvider, createConfig, fallback, http, webSocket } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { injected } from 'wagmi/connectors'; // Add injected connector for MetaMask

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [abstract],
  connectors: [
    injected({ target: 'metaMask' }), // Add MetaMask connector
  ],
  transports: {
    [abstract.id]: fallback([
      webSocket('wss://abstract-mainnet.public.blastapi.io'),
      http('https://abstract-mainnet.public.blastapi.io'),
    ]),
  },
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AbstractWalletProvider chain={abstract}>
            <App />
          </AbstractWalletProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </BrowserRouter>
  </React.StrictMode>
);