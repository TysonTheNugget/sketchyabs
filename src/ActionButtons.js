import React from 'react';

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
  const handleSelectClick = () => {
    if (isApproved) {
      setIsNftModalOpen(true);
    } else {
      handleApproveAll();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <button
        className="neon-button"
        onClick={handleSelectClick}
        disabled={isApproving}
      >
        {isApproving ? 'Approving...' : 'Select a Sketchy'}
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