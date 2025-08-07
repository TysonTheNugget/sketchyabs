import React, { useState, useEffect } from 'react';

function ActionButtons({
  isConnected,
  isApproved,
  selectedNft,
  isCreating,
  createGameStatus,
  joinGameStatus,
  joinGameError,
  handleCreateGame,
  handleRefreshGames,
  setIsNftModalOpen,
  handleApproveAll,
  isApproving,
}) {
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);

  useEffect(() => {
    if (isWaitingForApproval && isApproved) {
      setIsWaitingForApproval(false);
    }
  }, [isApproved, isWaitingForApproval]);

  const handleSelectClick = () => {
    if (isApproved) {
      setIsNftModalOpen(true);
    } else {
      handleApproveAll();
      setIsWaitingForApproval(true);
    }
  };

  const getSelectButtonContent = () => {
    if (isApproving) {
      return (
        <>
          <span className="game-spinner mr-1"></span>Approving...
        </>
      );
    } else if (isWaitingForApproval) {
      return (
        <>
          <span className="game-spinner mr-1"></span>Waiting for Approval...
        </>
      );
    } else {
      return 'Select a Sketchy';
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        className="neon-button flex items-center justify-center"
        onClick={handleSelectClick}
        disabled={isApproving || isWaitingForApproval}
      >
        {getSelectButtonContent()}
      </button>
      <button
        className="neon-button"
        onClick={handleCreateGame}
        disabled={!selectedNft || isCreating || !isApproved}
      >
        {isCreating ? 'Creating...' : 'Create Game'}
      </button>
      <button
        className="neon-button"
        onClick={handleRefreshGames}
      >
        Refresh Games
      </button>
      {selectedNft && (
        <div className="yellow-info flex flex-col items-center p-2">
          <img
            src={`https://f005.backblazeb2.com/file/sketchymilios/${selectedNft}.png`}
            alt={`Mymilio #${selectedNft}`}
            className="w-16 h-16 object-contain rounded"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/32x32?text=NF';
            }}
          />
          <p className="mt-1" style={{ color: "#222" }}>
            Mymilio #{selectedNft.toString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default ActionButtons;