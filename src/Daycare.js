import { useState, useEffect, useMemo } from "react";
import {
  useAccount,
  useReadContract,
  useReadContracts,
  useSimulateContract,
  useWriteContract,
} from "wagmi";
import NFT_ABI from "./abi/NftCollectionAbi.js";
import DAYCARE_ABI from "./abi/DaycareAbi.js";

const DAYCARE_ADDRESS = "0xd32247484111569930a0b9c7e669e8E108392496";
const NFT_ADDRESS = "0x08533A2b16e3db03eeBD5b23210122f97dfcb97d";

function Daycare() {
  const { address, isConnected } = useAccount();
  const [isSelectModalOpen, setIsSelectModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isWarningVisible, setIsWarningVisible] = useState(false);
  const [isApprovalPromptVisible, setIsApprovalPromptVisible] = useState(false);
  const [selectedNfts, setSelectedNfts] = useState([]);
  const [selectedDaycareIndices, setSelectedDaycareIndices] = useState([]);
  const [daycares, setDaycares] = useState([]);
  const [totalPoints, setTotalPoints] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isDroppingOff, setIsDroppingOff] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState(null);
  const [imageErrors, setImageErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState(null);
  const [singlePickUpIndex, setSinglePickUpIndex] = useState(null);
  const [singleClaimIndex, setSingleClaimIndex] = useState(null);

  // Fetch user's NFTs
  const {
    data: tokenIds,
    refetch: refetchTokenIds,
    error: tokenIdsError,
  } = useReadContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "tokensOfOwner",
    args: [address],
    query: { enabled: !!address && isConnected, staleTime: 30000 },
  });

  useEffect(() => {
    if (tokenIdsError)
      setErrorMessage(`Failed to fetch NFTs: ${tokenIdsError.message}`);
  }, [tokenIdsError]);

  // Fetch approval status
  const {
    data: approvalData,
    refetch: refetchApproval,
    error: approvalError,
  } = useReadContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "isApprovedForAll",
    args: [address, DAYCARE_ADDRESS],
    query: { enabled: !!address && isConnected, staleTime: 30000 },
  });

  useEffect(() => {
    setIsApproved(!!approvalData);
    if (approvalError)
      setErrorMessage(`Failed to check approval: ${approvalError.message}`);
  }, [approvalData, approvalError]);

  // Fetch daycares (staked info)
  const {
    data: daycaresData,
    refetch: refetchDaycares,
    error: daycaresError,
  } = useReadContract({
    address: DAYCARE_ADDRESS,
    abi: DAYCARE_ABI,
    functionName: "getDaycares",
    args: [address],
    query: { enabled: !!address && isConnected, staleTime: 30000 },
  });

  useEffect(() => {
    if (daycaresData) {
      setDaycares(daycaresData);
    }
    if (daycaresError)
      setErrorMessage(`Failed to fetch staked NFTs: ${daycaresError.message}`);
  }, [daycaresData, daycaresError]);

  // Batch fetch pending points
  const pendingContracts = useMemo(() => {
    return (
      daycares?.slice(0, 10).map((_, index) => ({
        address: DAYCARE_ADDRESS,
        abi: DAYCARE_ABI,
        functionName: "getPendingPoints",
        args: [address, BigInt(index)],
      })) || []
    );
  }, [daycares, address]);

  const { data: pendingData, error: pendingError } = useReadContracts({
    contracts: pendingContracts,
    query: { enabled: !!daycares?.length && isConnected, staleTime: 30000 },
  });

  useEffect(() => {
    if (pendingError)
      setErrorMessage(
        `Failed to fetch pending points: ${pendingError.message}`
      );
  }, [pendingError]);

  const enhancedDaycares = useMemo(() => {
    return (
      daycares?.map((daycare, index) => {
        const timestamp = Number(daycare.startTime) * 1000; // Convert seconds to milliseconds
        const stakedAt =
          timestamp > 0
            ? new Date(timestamp).toLocaleDateString(navigator.language, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "Not Staked";
        return {
          ...daycare,
          pending: pendingData?.[index]?.result?.toString() || "0",
          stakedAt,
        };
      }) || []
    );
  }, [daycares, pendingData]);

  // Fetch total points
  const { data: pointsData, error: pointsError } = useReadContract({
    address: DAYCARE_ADDRESS,
    abi: DAYCARE_ABI,
    functionName: "getTotalPoints",
    args: [address],
    query: { enabled: !!address && isConnected, staleTime: 30000 },
  });

  useEffect(() => {
    setTotalPoints(pointsData ? pointsData.toString() : "0");
    if (pointsError)
      setErrorMessage(`Failed to fetch total points: ${pointsError.message}`);
  }, [pointsData, pointsError]);

  // Simulate setApprovalForAll
  const { data: simulateApproveData } = useSimulateContract({
    address: NFT_ADDRESS,
    abi: NFT_ABI,
    functionName: "setApprovalForAll",
    args: [DAYCARE_ADDRESS, true],
    enabled: !!address && !isApproved && isConnected,
  });

  const { writeContract: approveContract } = useWriteContract();

  const handleApprove = async () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    if (simulateApproveData?.request) {
      setIsApproving(true);
      setErrorMessage(null);
      try {
        await approveContract(simulateApproveData.request, {
          onSuccess: () => {
            refetchApproval();
            setIsApproving(false);
            setIsApprovalPromptVisible(false);
          },
          onError: (err) => {
            setErrorMessage(`Approval failed: ${err.message}`);
            setIsApproving(false);
          },
        });
      } catch (err) {
        setErrorMessage(`Approval error: ${err.message}`);
        setIsApproving(false);
      }
    }
  };

  // Select all NFTs for dropOff
  const handleSelectAll = () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    setSelectedNfts(tokenIds?.map(BigInt) || []);
  };

  // Open modal for selection with warning/approval flow
  const handleSelectIndividual = () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    if (!isApproved) {
      setIsWarningVisible(true);
    } else {
      setIsSelectModalOpen(true);
    }
  };

  // Simulate dropOffMultiple
  const { data: simulateDropOffData } = useSimulateContract({
    address: DAYCARE_ADDRESS,
    abi: DAYCARE_ABI,
    functionName: "dropOffMultiple",
    args: [selectedNfts],
    enabled: selectedNfts.length > 0 && isApproved && isConnected,
  });

  const { writeContract: dropOffContract } = useWriteContract();

  const handleDropOff = async () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    if (!isApproved) {
      await handleApprove();
    }
    if (simulateDropOffData?.request) {
      setIsDroppingOff(true);
      setErrorMessage(null);
      try {
        await dropOffContract(simulateDropOffData.request, {
          onSuccess: () => {
            setSelectedNfts([]);
            refetchTokenIds();
            refetchDaycares();
            setIsDroppingOff(false);
          },
          onError: (err) => {
            setErrorMessage(`Drop-off failed: ${err.message}`);
            setIsDroppingOff(false);
          },
        });
      } catch (err) {
        setErrorMessage(`Drop-off error: ${err.message}`);
        setIsDroppingOff(false);
      }
    }
  };

  // Simulate pickUpMultiple
  const { data: simulatePickUpData } = useSimulateContract({
    address: DAYCARE_ADDRESS,
    abi: DAYCARE_ABI,
    functionName: "pickUpMultiple",
    args: [selectedDaycareIndices],
    enabled: selectedDaycareIndices.length > 0 && isConnected,
  });

  const { writeContract: pickUpContract } = useWriteContract();

  const handleWithdraw = async () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    if (simulatePickUpData?.request) {
      setIsWithdrawing(true);
      setErrorMessage(null);
      try {
        await pickUpContract(simulatePickUpData.request, {
          onSuccess: () => {
            setSelectedDaycareIndices([]);
            refetchTokenIds();
            refetchDaycares();
            setIsWithdrawing(false);
          },
          onError: (err) => {
            setErrorMessage(`Pick-up failed: ${err.message}`);
            setIsWithdrawing(false);
          },
        });
      } catch (err) {
        setErrorMessage(`Pick-up error: ${err.message}`);
        setIsWithdrawing(false);
      }
    }
  };

  // Simulate single pickUp
  const { data: simulateSinglePickUpData } = useSimulateContract({
    address: DAYCARE_ADDRESS,
    abi: DAYCARE_ABI,
    functionName: "pickUp",
    args:
      singlePickUpIndex !== null ? [BigInt(singlePickUpIndex)] : [BigInt(0)],
    enabled: singlePickUpIndex !== null && isConnected,
  });

  const handlePickUpSingle = async (index) => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    if (parseInt(enhancedDaycares[index]?.pending) > 0) {
      setErrorMessage("Please claim pending points before picking up.");
      return;
    }
    setSinglePickUpIndex(index);
    if (simulateSinglePickUpData?.request) {
      setIsWithdrawing(true);
      setErrorMessage(null);
      try {
        await pickUpContract(simulateSinglePickUpData.request, {
          onSuccess: () => {
            refetchTokenIds();
            refetchDaycares();
            setSinglePickUpIndex(null);
            setIsWithdrawing(false);
          },
          onError: (err) => {
            setErrorMessage(`Single pick-up failed: ${err.message}`);
            setIsWithdrawing(false);
            setSinglePickUpIndex(null);
          },
        });
      } catch (err) {
        setErrorMessage(`Single pick-up error: ${err.message}`);
        setIsWithdrawing(false);
        setSinglePickUpIndex(null);
      }
    }
  };

  // Simulate single claim
  const { data: simulateSingleClaimData } = useSimulateContract({
    address: DAYCARE_ADDRESS,
    abi: DAYCARE_ABI,
    functionName: "claimPoints",
    args: singleClaimIndex !== null ? [BigInt(singleClaimIndex)] : [BigInt(0)],
    enabled:
      singleClaimIndex !== null &&
      isConnected &&
      parseInt(enhancedDaycares[singleClaimIndex]?.pending) > 0,
  });

  const { writeContract: claimContract } = useWriteContract();

  const handleClaimSingle = async (index) => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    if (parseInt(enhancedDaycares[index]?.pending) === 0) {
      setErrorMessage(
        "No points available to claim for this NFT. Points may take 24 hours to accumulate."
      );
      return;
    }
    setSingleClaimIndex(index);
    if (simulateSingleClaimData?.request) {
      setIsClaiming(true);
      setErrorMessage(null);
      try {
        await claimContract(simulateSingleClaimData.request, {
          onSuccess: () => {
            refetchDaycares();
            setSingleClaimIndex(null);
            setIsClaiming(false);
          },
          onError: (err) => {
            setErrorMessage(`Single claim failed: ${err.message}`);
            setIsClaiming(false);
            setSingleClaimIndex(null);
          },
        });
      } catch (err) {
        setErrorMessage(`Single claim error: ${err.message}`);
        setIsClaiming(false);
        setSingleClaimIndex(null);
      }
    }
  };

  // Simulate claimMultiple
  const { data: simulateClaimData } = useSimulateContract({
    address: DAYCARE_ADDRESS,
    abi: DAYCARE_ABI,
    functionName: "claimMultiple",
    args: [
      enhancedDaycares
        .filter((d) => parseInt(d.pending) > 0)
        .map((_, index) => BigInt(index)),
    ],
    enabled:
      enhancedDaycares.some((d) => parseInt(d.pending) > 0) && isConnected,
  });

  const { writeContract: claimContractMultiple } = useWriteContract();

  const handleClaim = async () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    if (!enhancedDaycares.some((d) => parseInt(d.pending) > 0)) {
      setErrorMessage(
        "No points available to claim. Points may take 24 hours to accumulate."
      );
      return;
    }
    if (simulateClaimData?.request) {
      setIsClaiming(true);
      setErrorMessage(null);
      try {
        await claimContractMultiple(simulateClaimData.request, {
          onSuccess: () => {
            refetchDaycares();
            setTotalPoints("0");
            setIsClaiming(false);
          },
          onError: (err) => {
            setErrorMessage(`Claim failed: ${err.message}`);
            setIsClaiming(false);
          },
        });
      } catch (err) {
        setErrorMessage(`Claim error: ${err.message}`);
        setIsClaiming(false);
      }
    }
  };

  // Leaderboard fetch
  const {
    data: leaderboardData,
    refetch: fetchLeaderboardData,
    error: leaderboardFetchError,
  } = useReadContract({
    address: DAYCARE_ADDRESS,
    abi: DAYCARE_ABI,
    functionName: "getLeaderboard",
    query: { enabled: false, staleTime: 60000 },
  });

  useEffect(() => {
    if (leaderboardData) {
      const [users, points] = leaderboardData;
      setLeaderboard(
        users
          .map((user, i) => ({ address: user, points: points[i].toString() }))
          .sort((a, b) => parseInt(b.points) - parseInt(a.points))
      );
      setLeaderboardLoading(false);
    }
    if (leaderboardFetchError) {
      setLeaderboardError(
        `Failed to load leaderboard: ${leaderboardFetchError.message}`
      );
      setLeaderboardLoading(false);
    }
  }, [leaderboardData, leaderboardFetchError]);

  const handleLoadLeaderboard = async () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    setLeaderboardLoading(true);
    setLeaderboardError(null);
    try {
      await fetchLeaderboardData();
    } catch (err) {
      setLeaderboardError(`Leaderboard fetch error: ${err.message}`);
      setLeaderboardLoading(false);
    }
  };

  const handleImageError = (tokenId) => {
    setImageErrors((prev) => ({ ...prev, [tokenId]: true }));
    console.log(
      `Image failed for token ID ${tokenId} - check if it exists in bucket or token owned.`
    );
  };

  // Open modal for pickUp selection
  const handleWithdrawSelect = () => {
    if (!isConnected) {
      setErrorMessage("Please connect your wallet first.");
      return;
    }
    setIsWithdrawModalOpen(true);
  };

  const NftSelectionModal = ({ isStake }) => {
    const nfts = isStake ? tokenIds : enhancedDaycares.map((d) => d.tokenId);
    const selected = isStake ? selectedNfts : selectedDaycareIndices;
    const setSelected = isStake ? setSelectedNfts : setSelectedDaycareIndices;
    const setModalOpen = isStake
      ? setIsSelectModalOpen
      : setIsWithdrawModalOpen;

    return (
      <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="modal-content max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-black">Select NFTs</h2>
            <button
              className="text-2xl text-black"
              onClick={() => setModalOpen(false)}
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-3 gap-4 max-h-96 overflow-y-auto">
            {nfts?.map((tokenId, index) => (
              <div
                key={tokenId.toString()}
                className={`p-2 rounded-lg border ${
                  selected.includes(isStake ? tokenId : BigInt(index))
                    ? "border-orange-500 bg-orange-100"
                    : "border-gray-300"
                } cursor-pointer hover:bg-orange-50`}
                onClick={() => {
                  setSelected((prev) =>
                    prev.includes(isStake ? tokenId : BigInt(index))
                      ? prev.filter(
                          (id) => id !== (isStake ? tokenId : BigInt(index))
                        )
                      : [...prev, isStake ? tokenId : BigInt(index)]
                  );
                }}
              >
                <img
                  src={`https://f005.backblazeb2.com/file/sketchymilios/${tokenId}.png`}
                  alt={`Mymilio #${tokenId}`}
                  className="w-20 h-20 rounded border border-orange-500 object-cover"
                  onError={() => handleImageError(tokenId.toString())}
                />
                <p className="text-sm text-center text-black mt-1">
                  #{tokenId.toString()}
                </p>
                {imageErrors[tokenId] && (
                  <p className="text-red-500 text-xs text-center">
                    Image failed
                  </p>
                )}
              </div>
            )) || (
              <p className="text-sm text-center text-gray-500 col-span-3">
                No NFTs available
              </p>
            )}
          </div>
          <button
            className="neon-button w-full mt-4 py-2 text-sm"
            onClick={() => setModalOpen(false)}
          >
            Confirm Selection
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-5xl p-4 flex flex-col gap-4 mx-auto text-black min-h-screen overflow-y-auto">
      {errorMessage && (
        <p className="text-red-500 text-center text-sm p-2 bg-white bg-opacity-80 rounded-lg">
          {errorMessage}
        </p>
      )}
      <div className="game-card p-4 bg-white bg-opacity-90 rounded-lg shadow-lg">
        <h2 className="text-lg text-center mb-2 font-bold">Mymilio Drop-Off</h2>
        <div className="flex gap-4">
          <button
            className="neon-button w-full py-2 text-sm"
            onClick={handleSelectIndividual}
            disabled={!isConnected}
          >
            🎯 Select Mymilio
          </button>
          <button
            className="neon-button w-full py-2 text-sm"
            onClick={handleSelectAll}
            disabled={!isConnected}
          >
            🎰 Select All Mymilio
          </button>
        </div>
        <div className="w-full p-2 rounded-lg border border-orange-500 bg-white mt-2">
          {selectedNfts.length === 0 ? (
            <p className="text-sm text-center text-gray-500">
              No NFTs selected
            </p>
          ) : (
            <div className="grid grid-cols-5 gap-2">
              {selectedNfts.map((id) => (
                <div key={id.toString()} className="flex flex-col items-center">
                  <img
                    src={`https://f005.backblazeb2.com/file/sketchymilios/${id}.png`}
                    alt={`Mymilio #${id}`}
                    className="w-16 h-16 rounded border border-orange-500 object-cover"
                    onError={() => handleImageError(id.toString())}
                  />
                  {imageErrors[id] && (
                    <p className="text-red-500 text-xs">Image failed</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <button
          className="neon-button w-full mt-2 py-2 text-sm"
          onClick={handleDropOff}
          disabled={selectedNfts.length === 0 || isDroppingOff || !isConnected}
        >
          {isDroppingOff
            ? "Dropping Off..."
            : "🎰 Drop Off Selected Mymilio(s)"}
        </button>
      </div>
      <div className="game-card daycare-card w-full max-w-md p-4 mx-auto">
        <h2 className="neon-text text-lg text-center mb-4">
          Mymilio Playground
        </h2>
        <button
          className="neon-button w-full py-2 text-sm"
          onClick={handleClaim}
          disabled={
            enhancedDaycares.every((d) => parseInt(d.pending) === 0) ||
            isClaiming ||
            !isConnected
          }
        >
          {isClaiming ? "Claiming..." : "Claim All Points"}
        </button>
        <div className="flex flex-col gap-3 mt-4">
          {enhancedDaycares.length === 0 ? (
            <p className="yellow-info text-center text-sm">
              No Mymilios staked. Drop off some Mymilios to start earning
              points!
            </p>
          ) : (
            enhancedDaycares.map((d, index) => (
              <div
                key={index}
                className="staked-nft-card flex flex-col items-center p-3 rounded-lg"
              >
                <img
                  src={`https://f005.backblazeb2.com/file/sketchymilios/${d.tokenId}.png`}
                  alt={`Mymilio #${d.tokenId}`}
                  className="w-16 h-16 object-contain rounded mb-2"
                  loading="lazy"
                  onError={() => handleImageError(d.tokenId.toString())}
                />
                {imageErrors[d.tokenId] && (
                  <p className="text-red-500 text-xs text-center">
                    Image failed
                  </p>
                )}
                <p className="text-white text-xs font-bold">
                  Mymilio #{d.tokenId}
                </p>
                <p className="text-white text-xs">Daycared on: {d.stakedAt}</p>
                <p className="text-white text-xs">
                  Pending Points: {d.pending}
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  {parseInt(d.pending) > 0 && (
                    <button
                      className="neon-button tiny-button"
                      onClick={() => handleClaimSingle(index)}
                      disabled={isClaiming || !isConnected}
                    >
                      Claim
                    </button>
                  )}
                  <button
                    className="neon-button tiny-button"
                    onClick={() => handlePickUpSingle(index)}
                    disabled={
                      parseInt(d.pending) > 0 || isWithdrawing || !isConnected
                    }
                  >
                    Pick Up
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      <p className="game-card p-4 text-center text-sm font-bold bg-white bg-opacity-90 rounded-lg shadow-lg">
        Total Points: {totalPoints}
      </p>
      <div className="game-card p-4 bg-white bg-opacity-90 rounded-lg shadow-lg">
        <h2 className="text-lg text-center mb-2 font-bold">Leaderboard</h2>
        {leaderboardError && (
          <p className="text-red-500 text-center text-sm p-2">
            {leaderboardError}
          </p>
        )}
        <button
          className="neon-button w-full py-2 text-sm"
          onClick={handleLoadLeaderboard}
          disabled={leaderboardLoading || !isConnected}
        >
          {leaderboardLoading ? "Loading..." : "Load Leaderboard"}
        </button>
        <div className="mt-4 overflow-y-auto max-h-96">
          <table className="w-full border-collapse border border-orange-500 text-sm">
            <thead>
              <tr className="bg-orange-100">
                <th className="border border-orange-500 p-2">Rank</th>
                <th className="border border-orange-500 p-2">Address</th>
                <th className="border border-orange-500 p-2">Points</th>
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry, index) => (
                <tr key={index} className="hover:bg-orange-50">
                  <td className="border border-orange-500 p-2">{index + 1}</td>
                  <td className="border border-orange-500 p-2">
                    {entry.address.slice(0, 6)}...{entry.address.slice(-4)}
                  </td>
                  <td className="border border-orange-500 p-2">
                    {entry.points}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isWarningVisible && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-content max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-black mb-4">Warning</h2>
            <p className="text-black mb-4">
              This contract is verified on{" "}
              <a
                href="https://abscan.org/address/0xd32247484111569930a0b9c7e669e8E108392496#code"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-400 hover:text-blue-600"
              >
                ABS
              </a>
              . However, always conduct your own research (DYOR). Abstract may
              flag this address as malicious due to a known issue. Review the
              contract details shared on our official social channels for more
              information.
            </p>
            <button
              className="neon-button w-full py-2 text-sm"
              onClick={() => {
                setIsWarningVisible(false);
                setIsApprovalPromptVisible(true);
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
      {isApprovalPromptVisible && (
        <div className="modal fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="modal-content max-w-lg w-full p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-xl font-bold text-black mb-4">
              Approve Contract
            </h2>
            <p className="text-black mb-4">
              You need to approve the contract to allow it to transfer your
              NFTs.
            </p>
            <div className="flex justify-between gap-4">
              <button
                className="neon-button w-full py-2 text-sm"
                onClick={handleApprove}
                disabled={isApproving || !isConnected}
              >
                {isApproving ? "Approving..." : "Approve Contract"}
              </button>
              <button
                className="neon-button bg-gray-500 w-full py-2 text-sm"
                onClick={() => setIsApprovalPromptVisible(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isSelectModalOpen && <NftSelectionModal isStake={true} />}
      {isWithdrawModalOpen && <NftSelectionModal isStake={false} />}
    </div>
  );
}

export default Daycare;
