import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { AbstractWalletProvider } from '@abstract-foundation/agw-react';
import { abstract } from 'viem/chains';
import { WagmiProvider, createConfig, fallback, http, webSocket } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { injected } from 'wagmi/connectors';

// Reset viewport zoom on mobile after wallet modal interactions
const resetViewport = () => {
  if (window.innerWidth <= 768) {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, viewport-fit=cover');
    }
    document.documentElement.style.zoom = '1';
    document.body.style.zoom = '1';
    // Monitor for wallet modals and constrain them
    const modals = document.querySelectorAll(
      '.walletconnect-modal, [class*="walletconnect"], [class*="abstract"], [role="dialog"], iframe'
    );
    modals.forEach(modal => {
      modal.style.maxWidth = '100vw';
      modal.style.width = '100%';
      modal.style.overflowX = 'hidden';
      modal.style.transform = 'scale(1)';
      modal.style.position = 'fixed';
      modal.style.left = '0';
      modal.style.right = '0';
      modal.style.boxSizing = 'border-box';
    });
  }
};

// Run reset on load and after wallet interactions
window.addEventListener('load', resetViewport);
window.addEventListener('resize', resetViewport);

const queryClient = new QueryClient();

const wagmiConfig = createConfig({
  chains: [abstract],
  connectors: [
    injected({ target: 'metaMask' }),
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

// Run reset after render to catch wallet modals
setTimeout(resetViewport, 1000);