import React from 'react';

function HistoryModal({ isHistoryOpen, notifications, unresolvedCount, handleResolve, handleRefreshNotifications, setIsHistoryOpen }) {
  return (
    <div className="fixed bottom-4 right-4 flex space-x-2">
      <button
        id="resultsButton"
        className="relative"
        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
      >
        History
        {unresolvedCount > 0 && (
          <span id="resultsNotification">{unresolvedCount}</span>
        )}
      </button>
      <button
        className="neon-button text-sm py-1 px-2"
        onClick={handleRefreshNotifications}
      >
        Refresh
      </button>
      {isHistoryOpen && (
        <div className="modal">
          <div className="modal-content max-w-md p-4 bg-image-box">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-white">Game History</h2>
              <button
                className="close"
                onClick={() => setIsHistoryOpen(false)}
              >
                ✕
              </button>
            </div>
            <div id="resultsModalList">
              {notifications.length === 0 ? (
                <p className="text-white text-sm">No game history available.</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.transactionHash} className="game-card flex items-center space-x-2 p-2">
                    <img
                      src={`https://f005.backblazeb2.com/file/sketchymilios/${notif.tokenId1}.png`}
                      alt={`Mymilio #${notif.tokenId1}`}
                      className="w-8 h-8 object-contain rounded"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/32x32?text=NF';
                      }}
                    />
                    <img
                      src={`https://f005.backblazeb2.com/file/sketchymilios/${notif.tokenId2}.png`}
                      alt={`Mymilio #${notif.tokenId2}`}
                      className="w-8 h-8 object-contain rounded"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/32x32?text=NF';
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-white text-sm">
                        Game #{notif.gameId}: {notif.resolved ? (
                          <span className={notif.result === 'Won' ? 'text-green-500' : 'text-red-500'}>
                            You {notif.result}!
                          </span>
                        ) : (
                          'Result Pending'
                        )}
                      </p>
                      <p className="text-gray-400 text-xs">Date: {notif.localDate}</p>
                      {!notif.resolved && (
                        <button
                          className="neon-button text-xs py-1 px-2 mt-1"
                          onClick={() => handleResolve(notif)}
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              className="neon-button text-sm py-1 px-2 mt-2 w-full"
              onClick={handleRefreshNotifications}
            >
              Refresh History
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default HistoryModal;