import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useReadContracts, useSimulateContract, useWriteContract } from 'wagmi';
import { createPublicClient, http } from 'viem';
import { abstract } from 'viem/chains';
import NftModal from './NftModal';
import NFT_ABI from './abi/NftCollectionAbi.js';
import COINFLIP_ABI from './abi/CoinFlipGameAbi.js';
import ActionButtons from './ActionButtons';
import OpenGames from './OpenGames';
import HistoryModal from './HistoryModal';
import VideoPopup from './VideoPopup';

function BetASketchy() {
  const { address, isConnected } = useAccount();
  const [isNftModalOpen, setIsNftModalOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isVideoPopupOpen, setIsVideoPopupOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [selectedNft, setSelectedNft] = useState(null);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [createGameStatus, setCreateGameStatus] = useState(null);
  const [joinGameStatus, setJoinGameStatus] = useState(null);
  const [joinGameError, setJoinGameError] = useState(null);
  const [videoError, setVideoError] = useState(null);
  const [lastEventBlock, setLastEventBlock] = useState(() => BigInt(localStorage.getItem('lastEventBlock') || '0'));
  const [isInitialFetchDone, setIsInitialFetchDone] = useState(false);
  const [isJoiningGame, setIsJoiningGame] = useState(false);
  const [joinedGames, setJoinedGames] = useState([]);
  const [createdGames, setCreatedGames] = useState([]);
  const [prevOpenGameIds, setPrevOpenGameIds] = useState([]);
  const [resolvingGames, setResolvingGames] = useState([]);
  const [showApprovalPrompt, setShowApprovalPrompt] = useState(false);

  // Fetch NFTs owned by the connected wallet
  const { data: tokenIds, error: nftError, isLoading: nftLoading, refetch: refetchTokenIds } = useReadContract({
    address: '0x08533A2b16e3db03eeBD5b23210122f97dfcb97d',
    abi: NFT_ABI,
    functionName: 'tokensOfOwner',
    args: [address],
    query: { enabled: isConnected },
  });

  // Fetch open games
  const { data: openGameIds, error: openGamesError, refetch: refetchOpenGames } = useReadContract({
    address: '0xf6b8d2E0d36669Ed82059713BDc6ACfABe11Fde6',
    abi: COINFLIP_ABI,
    functionName: 'getOpenGames',
    query: { enabled: isConnected, staleTime: 10000 },
  });

  // Fetch game details for open games
  const gameContracts = openGameIds?.map((gameId) => ({
    address: '0xf6b8d2E0d36669Ed82059713BDc6ACfABe11Fde6',
    abi: COINFLIP_ABI,
    functionName: 'getGame',
    args: [gameId],
  })) || [];
  const { data: gameDetails } = useReadContracts({
    contracts: gameContracts,
    query: { enabled: !!openGameIds?.length },
  });

  // Check if CoinFlipGame is approved to transfer NFTs
  const { data: isApproved, error: approvalError, refetch: refetchApproval } = useReadContract({
    address: '0x08533A2b16e3db03eeBD5b23210122f97dfcb97d',
    abi: NFT_ABI,
    functionName: 'isApprovedForAll',
    args: [address, '0xf6b8d2E0d36669Ed82059713BDc6ACfABe11Fde6'],
    query: { enabled: isConnected && !!address },
  });

  // Simulate approveAll (setApprovalForAll)
  const { data: simulateApproveAllData, error: simulateApproveError } = useSimulateContract({
    address: '0x08533A2b16e3db03eeBD5b23210122f97dfcb97d',
    abi: NFT_ABI,
    functionName: 'setApprovalForAll',
    args: ['0xf6b8d2E0d36669Ed82059713BDc6ACfABe11Fde6', true],
    enabled: isConnected && !isApproved && showApprovalPrompt,
  });
  const { writeContract: approveAll, isPending: isApproving } = useWriteContract();

  // Prepare contract write for creating a game
  const { data: simulateCreateData, error: simulateCreateError } = useSimulateContract({
    address: '0xf6b8d2E0d36669Ed82059713BDc6ACfABe11Fde6',
    abi: COINFLIP_ABI,
    functionName: 'createGame',
    args: [selectedNft],
    enabled: isConnected && selectedNft !== null && typeof selectedNft === 'bigint' && isApproved && !!address && !!tokenIds?.length,
  });
  const { writeContract: createGame, isPending: isCreating, error: createError } = useWriteContract();

  // Prepare contract write for joining a game
  const { data: simulateJoinData, error: simulateJoinError } = useSimulateContract({
    address: '0xf6b8d2E0d36669Ed82059713BDc6ACfABe11Fde6',
    abi: COINFLIP_ABI,
    functionName: 'joinGame',
    args: [selectedGameId, selectedNft],
    enabled: isConnected && selectedGameId != null && selectedNft != null && isApproved && !!address,
  });
  const { writeContract: joinGame } = useWriteContract();

  // Handle approve all action
  const handleApproveAll = () => {
    if (simulateApproveAllData?.request) {
      approveAll(simulateApproveAllData.request, {
        onSuccess: () => {
          refetchApproval();
          setShowApprovalPrompt(false);
          setIsNftModalOpen(false);
        },
        onError: () => {
          setShowApprovalPrompt(false);
          setIsNftModalOpen(false);
        },
      });
    }
  };

  // Sync createdGames with openGameIds
  useEffect(() => {
    if (openGameIds && createdGames.includes(0n)) {
      const newGameIds = openGameIds.filter((id) => !prevOpenGameIds.includes(id));
      if (newGameIds.length > 0) {
        const latestGameId = newGameIds[newGameIds.length - 1];
        setCreatedGames((prev) => [...prev.filter((id) => id !== 0n), latestGameId]);
        setSelectedNft(null);
      }
      setPrevOpenGameIds(openGameIds || []);
    }
  }, [openGameIds, prevOpenGameIds]);

  // Clear selectedNft when joined game is resolved
  useEffect(() => {
    if (notifications.length > 0 && joinedGames.length > 0) {
      const hasResolvedGame = joinedGames.some((gameId) =>
        notifications.some((notif) => notif.gameId === gameId.toString())
      );
      if (hasResolvedGame) {
        setSelectedNft(null);
      }
    }
  }, [notifications, joinedGames]);

  // Clean up createdGames and joinedGames when resolved
  useEffect(() => {
    if (notifications.length > 0) {
      setCreatedGames((prev) => prev.filter((gameId) => !notifications.some((notif) => notif.gameId === gameId.toString())));
      setJoinedGames((prev) => prev.filter((gameId) => !notifications.some((notif) => notif.gameId === gameId.toString())));
    }
  }, [notifications]);

  // Trigger join transaction
  useEffect(() => {
    if (isJoiningGame && simulateJoinData?.request && selectedGameId != null && selectedNft != null) {
      joinGame(simulateJoinData.request, {
        onSuccess: () => {
          setJoinGameStatus('success');
          refetchOpenGames();
          refetchTokenIds();
          setSelectedGameId(null);
          setIsJoiningGame(false);
        },
        onError: (error) => {
          setJoinGameStatus('error');
          setJoinGameError(error.message);
          setSelectedGameId(null);
          setIsJoiningGame(false);
          setJoinedGames((prev) => prev.filter((id) => id !== selectedGameId));
        },
      });
    }
  }, [isJoiningGame, simulateJoinData, joinGame, refetchOpenGames, refetchTokenIds, selectedGameId, selectedNft]);

  // Fetch past GameResolved events
  const client = createPublicClient({
    chain: abstract,
    transport: http('https://api.mainnet.abs.xyz'),
  });
  const fetchPastEvents = async (isInitial = false) => {
    try {
      const fromBlock = isInitial ? 0n : lastEventBlock + 1n;
      const logs = await client.getLogs({
        address: '0xf6b8d2E0d36669Ed82059713BDc6ACfABe11Fde6',
        event: {
          type: 'event',
          name: 'GameResolved',
          inputs: [
            { type: 'uint256', name: 'gameId', indexed: false },
            { type: 'address', name: 'winner', indexed: false },
            { type: 'uint256', name: 'tokenId1', indexed: false },
            { type: 'uint256', name: 'tokenId2', indexed: false },
          ],
        },
        fromBlock,
        toBlock: 'latest',
      });
      const newNotifications = await Promise.all(
        logs.map(async ({ args, transactionHash, blockNumber }) => {
          try {
            const block = await client.getBlock({ blockNumber });
            const localDate = new Date(Number(block.timestamp) * 1000).toLocaleString();
            const game = await client.readContract({
              address: '0xf6b8d2E0d36669Ed82059713BDc6ACfABe11Fde6',
              abi: COINFLIP_ABI,
              functionName: 'getGame',
              args: [args.gameId],
            });
            return {
              gameId: args.gameId.toString(),
              result: args.winner === address ? 'Won' : 'Lost',
              tokenId1: args.tokenId1.toString(),
              tokenId2: args.tokenId2.toString(),
              timestamp: Number(block.timestamp) * 1000,
              localDate,
              player1: game.player1 || 'Unknown',
              player2: game.player2 || 'Unknown',
              transactionHash,
              resolved: false,
            };
          } catch {
            return null;
          }
        })
      );
      const validNotifications = newNotifications.filter((n) => n !== null && (n.player1 === address || n.player2 === address));
      setNotifications((prev) => {
        const updatedNotifications = isInitial
          ? validNotifications
          : [
              ...validNotifications,
              ...prev.filter((p) => !validNotifications.some((n) => n.transactionHash === p.transactionHash)),
            ];
        return updatedNotifications
          .filter((n) => n.player1 === address || n.player2 === address)
          .sort((a, b) => b.timestamp - a.timestamp);
      });
      if (logs.length > 0) {
        const latestBlock = await client.getBlockNumber();
        setLastEventBlock(latestBlock);
        localStorage.setItem('lastEventBlock', latestBlock.toString());
      }
    } catch {
      if (!isInitial) {
        await fetchPastEvents(true);
      }
    }
  };

  // Initial fetch (full history)
  useEffect(() => {
    if (!isConnected || !address) return;
    if (!isInitialFetchDone) {
      fetchPastEvents(true);
      setIsInitialFetchDone(true);
    }
  }, [address, isConnected, isInitialFetchDone]);

  // Fallback polling
  useEffect(() => {
    if (!isConnected || !address) return;
    const interval = setInterval(() => {
      refetchOpenGames();
      fetchPastEvents();
    }, 30000);
    return () => clearInterval(interval);
  }, [address, isConnected, refetchOpenGames]);

  useEffect(() => {
    const currentlyResolving = [
      ...createdGames,
      ...joinedGames
    ].filter(
      (gameId) =>
        !openGameIds?.includes(gameId) &&
        !notifications.some((n) => n.gameId === gameId.toString())
    );
    setResolvingGames(currentlyResolving);
  }, [openGameIds, notifications, createdGames, joinedGames]);

  const handleSelectNft = (tokenId) => {
    setSelectedNft(BigInt(tokenId));
    setCreateGameStatus(null);
    setJoinGameStatus(null);
    setJoinGameError(null);
    setVideoError(null);
    if (!isApproved) {
      setShowApprovalPrompt(true);
    } else {
      setShowApprovalPrompt(false);
      setIsNftModalOpen(false);
    }
  };

  const handleCreateGame = () => {
    if (simulateCreateData?.request) {
      createGame(simulateCreateData.request, {
        onSuccess: () => {
          setCreateGameStatus('success');
          setCreatedGames((prev) => [...prev, 0n]);
          refetchOpenGames();
          refetchTokenIds();
        },
        onError: () => {
          setCreateGameStatus('error');
        },
      });
    }
  };

  const handleJoinGame = (gameId) => {
    if (isJoiningGame) return;
    setSelectedGameId(BigInt(gameId));
    setJoinGameError(null);
    setIsJoiningGame(true);
    setJoinedGames((prev) => [...prev, BigInt(gameId)]);
  };

  const handleRefreshGames = () => {
    refetchOpenGames();
  };

  const handleRefreshNotifications = () => {
    fetchPastEvents(true);
  };

  const handleResolve = (notification) => {
    setSelectedNotification(notification);
    setIsVideoPopupOpen(true);
    setIsHistoryOpen(false);
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.transactionHash === notification.transactionHash ? { ...notif, resolved: true } : notif
      )
    );
  };

  const handleVideoError = (e, result) => {
    setVideoError(`Failed to load ${result === 'Won' ? 'win.mp4' : 'lose.mp4'}`);
  };

  const handleCloseVideoPopup = () => {
    setIsVideoPopupOpen(false);
    setSelectedNotification(null);
    setVideoError(null);
  };

  const handleViewHistory = () => {
    setIsHistoryOpen(true);
  };

  const unresolvedCount = notifications.filter((n) => !n.resolved).length;

  return (
    <div className="flex justify-center items-center min-h-[70vh] w-full">
      <div className="game-card w-full max-w-md p-4">
        {nftLoading && (
          <div id="loadingScreen" className="show">
            <div id="loadingText">Loading NFTs...</div>
          </div>
        )}
        {nftError && <p className="text-red-500 text-sm">Error fetching NFTs: {nftError.message}</p>}
        {createError && <p className="text-red-500 text-sm">Error creating game: {createError.message}</p>}
        {approvalError && <p className="text-red-500 text-sm">Error checking approval: {approvalError.message}</p>}
        {simulateApproveError && <p className="text-red-500 text-sm">Error simulating approval: {simulateApproveError.message}</p>}
        <ActionButtons
          isConnected={isConnected}
          isApproved={isApproved}
          selectedNft={selectedNft}
          isCreating={isCreating}
          createGameStatus={createGameStatus}
          joinGameStatus={joinGameStatus}
          joinGameError={joinGameError}
          handleCreateGame={handleCreateGame}
          handleRefreshGames={handleRefreshGames}
          setIsNftModalOpen={setIsNftModalOpen}
        />
        <OpenGames
          openGameIds={openGameIds}
          gameDetails={gameDetails}
          address={address}
          selectedNft={selectedNft}
          isJoiningGame={isJoiningGame}
          selectedGameId={selectedGameId}
          openGamesError={openGamesError}
          handleJoinGame={handleJoinGame}
          notifications={notifications}
          joinedGames={joinedGames}
          createdGames={createdGames}
          onViewHistory={handleViewHistory}
          resolvingGames={resolvingGames}
        />
      </div>
      <HistoryModal
        isHistoryOpen={isHistoryOpen}
        notifications={notifications}
        unresolvedCount={unresolvedCount}
        handleResolve={handleResolve}
        handleRefreshNotifications={handleRefreshNotifications}
        setIsHistoryOpen={setIsHistoryOpen}
      />
      <VideoPopup
        isVideoPopupOpen={isVideoPopupOpen}
        selectedNotification={selectedNotification}
        videoError={videoError}
        handleVideoError={handleVideoError}
        handleCloseVideoPopup={handleCloseVideoPopup}
      />
      {isNftModalOpen && (
        <NftModal
          tokenIds={tokenIds || []}
          selectedNfts={selectedNft ? [selectedNft] : []}
          onSelectNft={handleSelectNft}
          onClose={() => {
            setIsNftModalOpen(false);
            setShowApprovalPrompt(false);
          }}
          showWarning={!isApproved}
          showApprovalPrompt={showApprovalPrompt}
          handleApproveAll={handleApproveAll}
          isApproving={isApproving}
        />
      )}
    </div>
  );
}

export default BetASketchy;