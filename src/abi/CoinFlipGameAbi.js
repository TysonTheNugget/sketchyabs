const COINFLIP_ABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "_nftAddress", "type": "address" },
      { "internalType": "address", "name": "_gelatoOperator", "type": "address" }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "gameId", "type": "uint256" }
    ],
    "name": "GameCanceled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "player1", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId1", "type": "uint256" }
    ],
    "name": "GameCreated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "player2", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId2", "type": "uint256" }
    ],
    "name": "GameJoined",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "indexed": false, "internalType": "address", "name": "winner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId1", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId2", "type": "uint256" }
    ],
    "name": "GameResolved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "indexed": false, "internalType": "uint256", "name": "requestId", "type": "uint256" }
    ],
    "name": "RandomnessRequested",
    "type": "event"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" }
    ],
    "name": "cancelGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" }
    ],
    "name": "cancelUnjoinedGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "createGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "gelatoOperator",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" }
    ],
    "name": "getGame",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "player1", "type": "address" },
          { "internalType": "uint256", "name": "tokenId1", "type": "uint256" },
          { "internalType": "address", "name": "player2", "type": "address" },
          { "internalType": "uint256", "name": "tokenId2", "type": "uint256" },
          { "internalType": "bool", "name": "active", "type": "bool" },
          { "internalType": "uint256", "name": "requestId", "type": "uint256" },
          { "internalType": "bytes", "name": "data", "type": "bytes" },
          { "internalType": "uint256", "name": "joinTimestamp", "type": "uint256" },
          { "internalType": "uint256", "name": "createTimestamp", "type": "uint256" }
        ],
        "internalType": "struct CoinFlipGame.Game",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getOpenGames",
    "outputs": [
      { "internalType": "uint256[]", "name": "", "type": "uint256[]" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "gameId", "type": "uint256" },
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" }
    ],
    "name": "joinGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "nft",
    "outputs": [
      { "internalType": "contract IERC721", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "", "type": "uint256" }
    ],
    "name": "games",
    "outputs": [
      { "internalType": "address", "name": "player1", "type": "address" },
      { "internalType": "uint256", "name": "tokenId1", "type": "uint256" },
      { "internalType": "address", "name": "player2", "type": "address" },
      { "internalType": "uint256", "name": "tokenId2", "type": "uint256" },
      { "internalType": "bool", "name": "active", "type": "bool" },
      { "internalType": "uint256", "name": "requestId", "type": "uint256" },
      { "internalType": "bytes", "name": "data", "type": "bytes" },
      { "internalType": "uint256", "name": "joinTimestamp", "type": "uint256" },
      { "internalType": "uint256", "name": "createTimestamp", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "randomness", "type": "uint256" },
      { "internalType": "uint256", "name": "requestId", "type": "uint256" },
      { "internalType": "bytes", "name": "data", "type": "bytes" }
    ],
    "name": "_fulfillRandomness",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "_operator",
    "outputs": [
      { "internalType": "address", "name": "", "type": "address" }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];

export default COINFLIP_ABI;