import React from 'react';

function OpenGames({
  openGameIds,
  gameDetails,
  address,
  selectedNft,
  isJoiningGame,
  selectedGameId,
  openGamesError,
  handleJoinGame,
  notifications,
  joinedGames,
  createdGames,
  onViewHistory,
  resolvingGames,
}) {
  const displayedGameIds = [
    ...(openGameIds?.filter((gameId) => !notifications.some((notif) => notif.gameId === gameId.toString())) || []),
    ...createdGames.filter(
      (gameId) => !openGameIds?.includes(gameId) && !notifications.some((notif) => notif.gameId === gameId.toString())
    ),
    ...joinedGames.filter(
      (gameId) => !openGameIds?.includes(gameId) && !notifications.some((notif) => notif.gameId === gameId.toString())
    ),
    ...notifications
      .filter((notif) => 
        (notif.player1 === address || notif.player2 === address) &&
        (createdGames.includes(BigInt(notif.gameId)) || joinedGames.includes(BigInt(notif.gameId)))
      )
      .map((notif) => BigInt(notif.gameId)),
  ]
    .filter((gameId, index, self) => self.indexOf(gameId) === index)
    .sort((a, b) => (a > b ? -1 : a < b ? 1 : 0));

  return (
    <div id="openGamesList" className="mt-2">
      <h2 className="yellow-info text-xl mb-2" style={{ borderRadius: '1rem', marginBottom: '0.75rem' }}>Open Games</h2>
	  {resolvingGames && resolvingGames.length > 0 && (
  <div>
    <h3 className="yellow-info text-base mb-2">Resolving</h3>
    {resolvingGames.map((gameId) => (
      <div key={gameId.toString()} className="yellow-info flex items-center space-x-2 px-3 py-2 my-1">
        <span className="game-spinner mr-2"></span>
        <span className="font-bold">Game #{gameId.toString()} is resolving...</span>
      </div>
    ))}
  </div>
)}
      {openGamesError && <p className="text-red-500 status-pulse">Error loading games: {openGamesError.message}</p>}
      {!displayedGameIds || displayedGameIds.length === 0 ? (
        <p className="yellow-info">No open games available. Create one to start!</p>
      ) : (
        <div className="flex flex-col gap-2">
          {displayedGameIds.map((gameId, index) => {
            const gameData = gameDetails?.find((g, i) => openGameIds?.[i] === gameId)?.result;
            const isCreator = gameData?.player1?.toLowerCase() === address?.toLowerCase();
            const isJoined = joinedGames.includes(gameId) || (gameData?.player2?.toLowerCase() === address?.toLowerCase());
            const isResolved = notifications.some((notif) => notif.gameId === gameId.toString());
            const isCreating = createdGames.includes(gameId) && !openGameIds?.includes(gameId);
            const isWaiting = isCreator && openGameIds?.includes(gameId) && !gameData?.player2 && !isResolved;
            const isResolving = (isJoined || (isCreator && gameData?.player2 && gameData.player2 !== '0x0000000000000000000000000000000000000000')) && !isResolved;

            return (
              <div
  key={gameId.toString()}
  className="yellow-info flex flex-row items-center justify-between px-3 py-2 my-1"
  style={{ minWidth: "320px", width: "100%", maxWidth: "450px" }}
>
                <div className="flex items-center space-x-2">
                  {(gameData?.tokenId1 || isCreating) && (
                    <img
                      src={`https://f005.backblazeb2.com/file/sketchymilios/${gameData?.tokenId1 || selectedNft}.png`}
                      alt={`Mymilio #${gameData?.tokenId1 || selectedNft}`}
                      className="w-12 h-12 object-contain rounded"
                      loading="lazy"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/32x32?text=NF';
                      }}
                    />
                  )}
                  <div>
                    <p className="text-black text-xs font-bold mb-1">Game #{gameId.toString()}</p>
                    <p className="text-black text-xs font-bold mb-1">Player 1: {gameData?.player1 ? `${gameData.player1.slice(0, 6)}...${gameData.player1.slice(-4)}` : 'Loading...'}</p>
                    {isCreator && !isCreating && !isWaiting && !isJoined && !isResolved && (
                      <p className="text-yellow-500 text-xs status-pulse">You created this game</p>
                    )}
                    {isCreating && (
                      <p className="text-blue-500 text-xs flex items-center status-pulse">
                        <span className="game-spinner mr-1"></span> Creating Game
                      </p>
                    )}
                    {isWaiting && (
                      <p className="text-blue-500 text-xs status-pulse">Waiting for Player to Join</p>
                    )}
                    {isResolving && (
                      <p className="text-blue-500 text-xs flex items-center status-pulse">
                        <span className="game-spinner mr-1"></span> Resolving
                      </p>
                    )}
                    {isResolved && (
                      <p className="text-green-500 text-xs status-pulse">Game Completed</p>
                    )}
                  </div>
                </div>
                {isResolved && (isCreator || isJoined) ? (
                  <button
                    className="neon-button text-sm py-1 px-2"
                    onClick={onViewHistory}
                  >
                    View
                  </button>
                ) : (
                  <button
                    className="neon-button text-sm py-1 px-2"
                    onClick={() => handleJoinGame(gameId)}
                    disabled={!selectedNft || isJoiningGame || isCreator || isJoined || isCreating || isWaiting}
                    title={
                      isCreator
                        ? 'You cannot join your own game'
                        : !selectedNft
                        ? 'Select an NFT first'
                        : isJoined
                        ? 'You have already joined this game'
                        : isCreating
                        ? 'Game is being created'
                        : isWaiting
                        ? 'Waiting for another player'
                        : ''
                    }
                  >
                    {isJoiningGame && selectedGameId === gameId ? 'Joining...' : 'Join'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default OpenGames;