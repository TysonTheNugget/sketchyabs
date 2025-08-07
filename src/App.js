import { useState } from 'react';
import { useLoginWithAbstract } from '@abstract-foundation/agw-react';
import { useAccount, useDisconnect } from 'wagmi';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import BetASketchy from './BetASketchy';
import Daycare from './Daycare';

function NavBar({ isConnected, address, handleConnect, handleDisconnect, location }) {
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
      <button
        className="neon-button"
        onClick={isConnected ? handleDisconnect : handleConnect}
      >
        {isConnected ? `Disconnect: ${address ? `${address.slice(0, 6)}...${address.slice(-4)}` : '...'}` : 'Connect Wallet'}
      </button>
    </div>
  );
}

function App() {
  const { login } = useLoginWithAbstract();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();
  const [navigateError, setNavigateError] = useState(null);
  const location = useLocation();

  const handleConnect = async () => {
    try {
      await login();
      setNavigateError(null);
    } catch {
      setNavigateError('Failed to connect wallet. Please try again.');
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
        handleConnect={handleConnect}
        handleDisconnect={handleDisconnect}
        location={location}
      />
      {location.pathname === '/' && (
        <>
          <h1 className="text-3xl font-bold mb-8">Mymilios</h1>
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