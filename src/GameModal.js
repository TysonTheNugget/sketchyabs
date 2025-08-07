import { useState } from 'react';
import { useSimulateContract, useWriteContract, useReadContracts } from 'wagmi';
import COINFLIP_ABI from './abi/CoinFlipGameAbi.js';

const useGameDetails = (openGameIds) => {
  const contracts = openGameIds?.map((gameId) => ({
    address: '0xf6b8d2E0d36669Ed82059713BDc6ACfABe11Fde6',
    abi: COINFLIP_ABI,
    functionName: 'getGame',
    args: [gameId],
  })) || [];

  const { data, error } = useReadContracts({
    contracts,
    query: { enabled: !!openGameIds?.length },
  });

  return openGameIds?.map((gameId, index) => ({
    gameId,
    data: data?.[index]?.result,
    error: error?.[index] || null,
  })) || [];
};

const GameModal = ({ openGameIds, selectedNft, onJoinGame, onClose }) => {
  const [selectedGameId, setSelectedGameId] = useState(null);
  const gameDetails = useGameDetails(openGameIds);

  // Prepare contract write for joining a game
  const { data: simulateData, error: simulateError } = useSimulateContract({
    address: '0xf6b8d2E0d36669Ed82059713BDc6ACfABe11Fde6',
    abi: COINFLIP_ABI,
    functionName: 'joinGame',
    args: [selectedGameId, selectedNft],
    enabled: selectedGameId !== null && selectedNft !== null && typeof selectedGameId === 'bigint' && typeof selectedNft === 'bigint',
  });

  const { writeContract, isPending, error: writeError } = useWriteContract();

  const handleJoin = () => {
    if (simulateData?.request) {
      writeContract(simulateData.request, {
        onSuccess: () => {
          onJoinGame();
        },
        onError: () => {},
      });
    }
  };

  return (
    <div className="modal">
      <div className="modal-content max-w-md p-4 bg-image-box">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-bold text-white">Bet a Sketchy - Open Games</h2>
          <button
            className="close"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
        {!openGameIds || openGameIds.length === 0 ? (
          <p className="text-white">No open games available. Try creating a game first.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {gameDetails.map(({ gameId, data, error }) => (
              <div
                key={gameId}
                className="game-card flex justify-between items-center p-2"
              >
                <div className="flex items-center space-x-2">
                  {data?.tokenId1 && (
                    <img
                      src={`https://f005.backblazeb2.com/file/sketchymilios/${data.tokenId1}.png`}
                      alt={`Mymilio #${data.tokenId1}`}
                      className="w-12 h-12 object-contain rounded"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/32x32?text=NF';
                      }}
                    />
                  )}
                  <div>
                    <p className="text-white text-sm">Game #{gameId.toString()}</p>
                    <p className="text-gray-300 text-sm">Player 1: {data?.player1 || 'Loading...'}</p>
                    <p className="text-gray-300 text-sm">NFT ID: {data?.tokenId1?.toString() || 'Loading...'}</p>
                    <p className="text-gray-300 text-sm">Selected NFT: {selectedNft?.toString() || 'None'}</p>
                    {error && <p className="text-red-500 text-xs status-pulse">Error: {error.message}</p>}
                  </div>
                </div>
                <button
                  className="neon-button text-sm py-1 px-2"
                  onClick={() => setSelectedGameId(gameId)}
                  disabled={selectedNft === null}
                >
                  Select Game
                </button>
              </div>
            ))}
            {selectedGameId !== null && (
              <div className="mt-2">
                <button
                  className="neon-button w-full text-sm py-1 px-2"
                  onClick={handleJoin}
                  disabled={isPending || !simulateData}
                >
                  {isPending ? 'Joining...' : 'Join Game'}
                </button>
                {simulateError && <p className="text-red-500 text-xs mt-1 status-pulse">Simulate Error: {simulateError.message}</p>}
                {writeError && <p className="text-red-500 text-xs mt-1 status-pulse">Write Error: {writeError.message}</p>}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default GameModal;