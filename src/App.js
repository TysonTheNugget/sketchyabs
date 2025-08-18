import { useState } from 'react';
import { useLoginWithAbstract } from '@abstract-foundation/agw-react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import BetASketchy from './BetASketchy';
import Daycare from './Daycare';
import { injected } from 'wagmi/connectors'; // Injected connector for MetaMask, Rabby, etc.
import { abstract } from 'viem/chains'; // Abstract chain

function NavBar({ isConnected, address, handleConnectAbstract, handleConnectInjected, handleDisconnect, location }) {
  return (
    <div id="gameInterface" className="flex justify-between items-center mb-8">
      {location.pathname !== '/' && (
        <Link to="/">
          <button className="neon-button">
            Home
          </button>
        </Link>
      )}
      <div className="flex-1"></div>
      <div className="flex space-x-2">
        <button
          className="neon-button"
          onClick={handleConnectAbstract}
          disabled={isConnected}
        >
          Connect Abstract Wallet
        </button>
        <button
          className="neon-button"
          onClick={handleConnectInjected}
          disabled={isConnected}
        >
          Mobile Wallet 
        </button>
        {isConnected && (
          <button
            className="hidden"
            onClick={handleDisconnect}
          >
            Disconnect: {address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '...'}
          </button>
        )}
      </div>
    </div>
  );
}

function App() {
  const { login } = useLoginWithAbstract();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const [navigateError, setNavigateError] = useState(null);
  const location = useLocation();

  const handleConnectAbstract = async () => {
    try {
      await login();
      setNavigateError(null);
    } catch {
      setNavigateError('Failed to connect Abstract Wallet. Please try again.');
    }
  };

  const handleConnectInjected = async () => {
    try {
      // Ensure an injected wallet is available
      if (!window.ethereum) {
        setNavigateError('No wallet detected. Please install MetaMask, Rabby, or another compatible wallet.');
        return;
      }

      // Check if Abstract chain is added to the wallet
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${abstract.id.toString(16)}` }],
        });
      } catch (switchError) {
        // If chain is not added (error code 4902), add it
        if (switchError.code === 4902) {
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: `0x${abstract.id.toString(16)}`,
                  chainName: 'Abstract',
                  rpcUrls: ['https://abstract-mainnet.public.blastapi.io'],
                  nativeCurrency: {
                    name: 'Ether',
                    symbol: 'ETH',
                    decimals: 18,
                  },
                  blockExplorerUrls: ['https://abscan.org'],
                },
              ],
            });
          } catch (addError) {
            setNavigateError('Failed to add Abstract chain. Please add it manually in your wallet.');
            return;
          }
        } else {
          setNavigateError('Failed to switch to Abstract chain. Please try again.');
          return;
        }
      }

      // Connect using the injected connector
      await connect({ connector: injected() });
      setNavigateError(null);
    } catch (error) {
      setNavigateError('Failed to connect wallet. Ensure your wallet is unlocked and try again.');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setNavigateError(null);
  };

  return (
    <div id="gameInterface" className="min-h-screen flex flex-col items-center p-4">
      <NavBar
        isConnected={isConnected}
        address={address}
        handleConnectAbstract={handleConnectAbstract}
        handleConnectInjected={handleConnectInjected}
        handleDisconnect={handleDisconnect}
        location={location}
      />
      {location.pathname === '/' && (
        <>
          <h1 className="neon-text text-xl mb-2">Mymilio dApps</h1>
          {navigateError && <p className="text-red-500 mb-4 status-pulse">{navigateError}</p>}
          <div className="space-y-4">
            <Link to="/bet-a-sketchy">
              <button className="neon-button">
                Bet a Sketchy
              </button>
            </Link>
            <Link to="/daycare">
              <button className="neon-button">
                Daycare
              </button>
            </Link>
          </div>
        </>
      )}
      <Routes>
        <Route path="/bet-a-sketchy" element={<BetASketchy />} />
        <Route path="/daycare" element={<Daycare />} />
        <Route path="/" element={null} />
      </Routes>
    </div>
  );
}

export default App;