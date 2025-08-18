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
  refetchTokenIds,
}) {
  const [isWaitingForApproval, setIsWaitingForApproval] = useState(false);
  const [approvalPending, setApprovalPending] = useState(false);
  const [showWaitMessage, setShowWaitMessage] = useState(false);

  useEffect(() => {
    if (isApproved) {
      setApprovalPending(false);
      setIsWaitingForApproval(false);
      setShowWaitMessage(false);
    }
  }, [isApproved]);

  useEffect(() => {
    if (showWaitMessage) {
      const timer = setTimeout(() => setShowWaitMessage(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showWaitMessage]);

  const handleSelectClick = async () => {
    if (isApproved) {
      await refetchTokenIds();
      setIsNftModalOpen(true);
    } else if (approvalPending) {
      setShowWaitMessage(true);
    } else {
      handleApproveAll();
      setApprovalPending(true);
      setIsWaitingForApproval(true);
      setTimeout(() => setIsWaitingForApproval(false), 8000);
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
    <div className="flex flex-col gap-2 w-full max-w-sm">
      <button
        className="neon-button flex items-center justify-center"
        onClick={handleSelectClick}
        disabled={isApproving || isWaitingForApproval}
      >
        {getSelectButtonContent()}
      </button>
      {showWaitMessage && (
        <p className="text-yellow-500 text-sm text-center status-pulse">
          Please wait for the approval to confirm.
        </p>
      )}
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
            className="w-12 h-12 object-contain rounded"
            loading="lazy"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/32x32?text=NF';
            }}
          />
          <p className="mt-1 text-sm" style={{ color: "#222" }}>
            Mymilio #{selectedNft.toString()}
          </p>
        </div>
      )}
    </div>
  );
}

export default ActionButtons;