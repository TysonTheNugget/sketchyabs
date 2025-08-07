import { useState, useEffect } from 'react';

const NftModal = ({ tokenIds, selectedNfts, onSelectNft, onClose, showWarning, showApprovalPrompt, handleApproveAll, isApproving }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [imageErrors, setImageErrors] = useState({});
  const [isWarningVisible, setIsWarningVisible] = useState(showWarning);
  const [isApprovalPromptVisible, setIsApprovalPromptVisible] = useState(showApprovalPrompt);

  useEffect(() => {
    if (tokenIds !== undefined) {
      setTimeout(() => setIsLoading(false), 500);
    } else {
      setIsLoading(false);
    }
  }, [tokenIds]);

  useEffect(() => {
    setIsWarningVisible(showWarning);
    setIsApprovalPromptVisible(showApprovalPrompt);
  }, [showWarning, showApprovalPrompt]);

  const handleImageError = (tokenId) => {
    setImageErrors((prev) => ({
      ...prev,
      [tokenId]: true,
    }));
  };

  const handleSelect = (tokenId) => {
    onSelectNft(tokenId);
    if (!showApprovalPrompt) {
      onClose();
    }
  };

  const handleApproveAndSelect = (tokenId) => {
    handleApproveAll();
    onSelectNft(tokenId);
  };

  return (
    <div className="modal">
      {isWarningVisible && (
        <div className="modal-content max-w-md p-4 bg-image-box">
          <h2 className="neon-text text-xl mb-2">Warning</h2>
          <p className="neon-text text-xl mb-2">
            This contract is verified on <a href="https://abscan.org/address/0xf6b8d2E0d36669Ed82059713BDc6ACfABe11Fde6#code" target="_blank" rel="noopener noreferrer" className="underline text-blue-400 hover:text-blue-600">ABS</a>. However, always conduct your own research (DYOR). Abstract may flag this address as malicious due to a known issue. Review the contract details shared on our official social channels for more information.
          </p>
          <button
            className="neon-button w-full text-sm py-1 px-2"
            onClick={() => setIsWarningVisible(false)}
          >
            Continue
          </button>
        </div>
      )}
      {!isWarningVisible && isApprovalPromptVisible && (
        <div className="modal-content max-w-md p-4 bg-image-box">
          <h2 className="neon-text text-xl mb-2">Approve Contract</h2>
          <p className="neon-text text-xl mb-2">
            You need to approve the contract to allow it to transfer your NFTs.
          </p>
          <div className="flex justify-between items-center mb-2">
            <button
              className="neon-button text-sm py-1 px-2"
              onClick={() => handleApproveAndSelect(selectedNfts[0] || tokenIds[0])}
              disabled={isApproving}
            >
              {isApproving ? 'Approving...' : 'Approve Contract'}
            </button>
            <button
              className="neon-button bg-gray-500 text-sm py-1 px-2"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {!isWarningVisible && !isApprovalPromptVisible && (
        <div className="modal-content max-w-md p-4 bg-image-box">
          <div className="flex justify-between items-center mb-2">
            <h2 className="neon-text text-xl mb-2">Select to join/create game</h2>
            <button
              className="close"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          {isLoading ? (
            <div id="loadingScreen" className="show">
              <div id="loadingText">Loading NFTs...</div>
            </div>
          ) : tokenIds === undefined ? (
            <p className="text-white text-sm">Error: Unable to fetch NFTs. Check contract address or network.</p>
          ) : tokenIds.length === 0 ? (
            <p className="neon-text text-xl mb-2">No Sketchys found in your wallet/Connect Wallet.</p>
          ) : (
            <div className="nft-grid">
              {tokenIds.map((tokenId) => (
                <div
                  key={tokenId}
                  className={`nft-item ${selectedNfts.includes(tokenId) ? 'border-blue-500' : ''}`}
                  onClick={() => handleSelect(tokenId)}
                >
                  <img
                    src={`https://f005.backblazeb2.com/file/sketchymilios/${tokenId}.png`}
                    alt={`Mymilio #${tokenId}`}
                    className="w-full max-w-[100px] object-contain rounded"
                    loading="lazy"
                    onError={(e) => {
                      handleImageError(tokenId);
                      e.target.src = 'https://via.placeholder.com/32x32?text=NF';
                    }}
                  />
                  <p className="mt-1 text-white text-sm">Mymilio #{tokenId}</p>
                  {imageErrors[tokenId] && (
                    <p className="text-red-500 text-xs status-pulse">Image failed to load</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NftModal;