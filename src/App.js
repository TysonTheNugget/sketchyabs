import { useState } from 'react';
import { useLoginWithAbstract } from '@abstract-foundation/agw-react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import BetASketchy from './BetASketchy';
import Daycare from './Daycare';
import { injected } from 'wagmi/connectors';
import { abstract } from 'viem/chains';

function NavBar({ isConnected, address, handleConnectAbstract, handleConnectInjected, handleDisconnect, location }) {
  return (
    <div id="gameInterface" className="flex flex-col items-center mb-4 space-y-2">
      {location.pathname !== '/' && (
        <Link to="/">
          <button className="neon-button w-full">
            Home
          </button>
        </Link>
      )}
      <div className="flex flex-col space-y-2 w-full max-w-sm">
        <button
          className="neon-button w-full"
          onClick={handleConnectAbstract}
          disabled={isConnected}
        >
          Connect Abstract Wallet
        </button>
        <button
          className="neon-button w-full"
          onClick={handleConnectInjected}
          disabled={isConnected}
        >
          Connect Wallet (MetaMask, Rabby, etc.)
        </button>
        {isConnected && (
          <button
            className="neon-button w-full"
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
      if (!window.ethereum) {
        setNavigateError('No wallet detected. Please install MetaMask, Rabby, or another compatible wallet.');
        return;
      }

      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${abstract.id.toString(16)}` }],
        });
      } catch (switchError) {
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
    <div id="gameInterface" className="min-h-screen flex flex-col items-center p-2">
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
          <h1 className="neon-text text-lg mb-2">Mymilio dApps</h1>
          {navigateError && <p className="text-red-500 mb-4 text-sm status-pulse">{navigateError}</p>}
          <div className="flex flex-col space-y-2 w-full max-w-sm">
            <Link to="/bet-a-sketchy">
              <button className="neon-button w-full">
                Bet a Sketchy
              </button>
            </Link>
            <Link to="/daycare">
              <button className="neon-button w-full">
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