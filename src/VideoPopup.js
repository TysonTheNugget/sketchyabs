import React from 'react';

function VideoPopup({ isVideoPopupOpen, selectedNotification, videoError, handleVideoError, handleCloseVideoPopup }) {
  return (
    isVideoPopupOpen && selectedNotification && (
      <div
        id="videoOverlay"
        className="modal fade-in"
        onClick={handleCloseVideoPopup}
      >
        <div
          className="modal-content max-w-md p-4 bg-image-box"
          onClick={(e) => e.stopPropagation()}
        >
          <div id="animationNFTs" className="flex gap-2 justify-center mb-2">
            <img
              src={`https://f005.backblazeb2.com/file/sketchymilios/${selectedNotification.tokenId1}.png`}
              alt={`Mymilio #${selectedNotification.tokenId1}`}
              className="w-12 h-12 rounded"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/40x40?text=NF';
              }}
            />
            <img
              src={`https://f005.backblazeb2.com/file/sketchymilios/${selectedNotification.tokenId2}.png`}
              alt={`Mymilio #${selectedNotification.tokenId2}`}
              className="w-12 h-12 rounded"
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/40x40?text=NF';
              }}
            />
          </div>
          <p className={`text-base font-bold text-center ${selectedNotification.result === 'Won' ? 'text-green-500' : 'text-red-500'} status-pulse`}>
            You {selectedNotification.result}!
          </p>
          <video
            src={selectedNotification.result === 'Won' ? '/assets/win.mp4' : '/assets/lose.mp4'}
            autoPlay
            muted
            playsInline
            className="w-full max-w-[150px] mt-2 rounded mx-auto"
            onError={(e) => handleVideoError(e, selectedNotification.result)}
          >
            <source src={selectedNotification.result === 'Won' ? '/assets/win.mp4' : '/assets/lose.mp4'} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {videoError && <p className="text-red-500 text-xs mt-1 text-center status-pulse">{videoError}</p>}
          <button
            className="neon-button text-sm py-1 px-2 mt-2 w-full"
            onClick={handleCloseVideoPopup}
          >
            Close
          </button>
        </div>
      </div>
    )
  );
}

export default VideoPopup;