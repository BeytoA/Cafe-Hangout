import {
  engine,
  PlayerIdentityData,
  Schemas,
  Transform
} from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { getPlayer } from '@dcl/sdk/src/players'
import { registerMessages } from '@dcl/sdk/network'
import { room } from 'src'
import {
  cafeGameSystem,
  takeCustomerOrder,
  brewCoffee,
  collectSnack,
  deliverOrder,
  cleanTable,
  getCustomerState,
  sendInventory,
  sendScore,
  enginePlayerPositions,
  startCafeRound
} from './cafeGame'
import { startGameServer } from './gameServer'


// --------------------------------------------------
// TYPES
// --------------------------------------------------

export type CafePlayer = {
  address: string
  name: string
  isGuest: boolean
}

export type CafeLobby = {
  lobbyId: number
  round: number
  hostAddress: string
  gameStarted: boolean
  players: CafePlayer[]
}

// --------------------------------------------------
// SCHEMAS
// --------------------------------------------------

const CafePlayerSchema = Schemas.Map({
  address: Schemas.String,
  name: Schemas.String,
  isGuest: Schemas.Boolean
})

const CafeLobbySchema = Schemas.Map({
  lobbyId: Schemas.Number,
  round: Schemas.Number,
  hostAddress: Schemas.String,
  gameStarted: Schemas.Boolean,
  players: Schemas.Array(CafePlayerSchema)
})

export const Messages = {
  // Client -> Server
  getPlayerList: Schemas.Map({}),

  joinEmptyLobby: Schemas.Map({}),

  joinPlayer: Schemas.Map({
    toAddress: Schemas.String
  }),

  invitePlayer: Schemas.Map({
    fromAddress: Schemas.String,
    toAddress: Schemas.String
  }),

  startGame: Schemas.Map({}),

  // Server -> Client
  playerList: Schemas.Map({
    players: Schemas.Array(CafePlayerSchema),
    currentLobby: CafeLobbySchema,
    isHost: Schemas.Boolean
  }),

  deliverInvitation: Schemas.Map({
    fromAddress: Schemas.String
  }),

  gameStarted: Schemas.Map({
    lobbyId: Schemas.Number,
    players: Schemas.Array(CafePlayerSchema)
  }),

  lobbyState: Schemas.Map({
    lobbyId: Schemas.Number,
    round: Schemas.Number,
    players: Schemas.Array(
      Schemas.Map({
        position: Schemas.Vector3,
        address: Schemas.String
      })
    )
  }),
  customerState: Schemas.Map({
  customers: Schemas.Array(
    Schemas.Map({
      id: Schemas.Number,
      position: Schemas.Vector3,
      tableId: Schemas.Number,
      state: Schemas.String
    })
  )
}),

customerOrder: Schemas.Map({
  customerId: Schemas.Number,
  drink: Schemas.String,
  snack: Schemas.String
}),

inventoryUpdate: Schemas.Map({
  espresso: Schemas.Number,
  cappuccino: Schemas.Number,
  cupcake: Schemas.Number,
  cheesecake: Schemas.Number
}),

scoreUpdate: Schemas.Map({
  score: Schemas.Number
}),

tableCleaned: Schemas.Map({
  tableId: Schemas.Number
}),

takeCustomerOrder: Schemas.Map({
  customerId: Schemas.Number
}),

brewCoffee: Schemas.Map({
  drink: Schemas.String
}),

collectSnack: Schemas.Map({
  snack: Schemas.String
}),

deliverOrder: Schemas.Map({
  customerId: Schemas.Number
}),

cleanTable: Schemas.Map({
  tableId: Schemas.Number
}),

startCafeRound: Schemas.Map({
  round: Schemas.Number
}),

roundComplete: Schemas.Map({
  round: Schemas.Number
}),

playerPosition: Schemas.Map({
  position: Schemas.Vector3
}),
gameState: Schemas.Map({
  started: Schemas.Boolean,
  round: Schemas.Number,
  customers: Schemas.Array(
    Schemas.Map({
      id: Schemas.Number,
      tableId: Schemas.Number,
      position: Schemas.Vector3,
      state: Schemas.String,
      coffee: Schemas.String,
      food: Schemas.String
    })
  )
})


}

// --------------------------------------------------
// SERVER STATE
// --------------------------------------------------

const lobbyList: CafeLobby[] = []

let lobbyStateTimer = 0

// --------------------------------------------------
// START SERVER
// --------------------------------------------------

export function startServer() {
  console.log('[SERVER] Server started')

  engine.addSystem(serverSystem)

  // -----------------------------------------------
  // GET PLAYER LIST
  // -----------------------------------------------

  room.onMessage('getPlayerList', (_data, context) => {
    if (!context) return

    const playerList: CafePlayer[] = []

    for (const [, identity] of engine.getEntitiesWith(
      PlayerIdentityData
    )) {
      const playerData = getPlayer({
        userId: identity.address
      })

      if (!playerData) continue

      playerList.push({
        address: identity.address,
        name: playerData.name,
        isGuest: identity.isGuest
      })
    }

    const currentLobby = getCurrentLobby(context.from)

    const isHost =
      currentLobby.lobbyId > 0 &&
      currentLobby.hostAddress === context.from

    room.send(
      'playerList',
      {
        players: playerList,
        currentLobby,
        isHost
      },
      {
        to: [context.from]
      }
    )
  })

  // -----------------------------------------------
  // INVITE PLAYER
  // -----------------------------------------------

  room.onMessage('invitePlayer', (data, context) => {
    if (!context) return

    console.log(
      `[SERVER] ${context.from} invited ${data.toAddress}`
    )

    // Do not trust fromAddress from the client.
    // context.from is authoritative.
    room.send(
      'deliverInvitation',
      {
        fromAddress: context.from
      },
      {
        to: [data.toAddress]
      }
    )
  })

  // -----------------------------------------------
  // JOIN EMPTY LOBBY
  // -----------------------------------------------

  room.onMessage('joinEmptyLobby', (_data, context) => {
    if (!context) return

    console.log(
      `[SERVER] ${context.from} is creating a new lobby`
    )

    removePlayerFromAllLobbies(context.from)

    const player = createCafePlayer(context.from)

    if (!player) {
      console.log(
        `[SERVER] Could not create player ${context.from}`
      )
      return
    }

    const newLobby: CafeLobby = {
      lobbyId: generateLobbyId(),
      round: 1,
      hostAddress: context.from,
      gameStarted: false,
      players: [player]
    }

    lobbyList.push(newLobby)

    console.log(
      `[SERVER] Player ${context.from} created lobby ${newLobby.lobbyId}`
    )

    sendPlayerList(context.from)
  })

  // -----------------------------------------------
  // JOIN PLAYER
  // -----------------------------------------------

  room.onMessage('joinPlayer', (data, context) => {
    if (!context) return

    if (data.toAddress === context.from) {
      console.log(
        `[SERVER] ${context.from} cannot join own lobby`
      )
      return
    }

    const targetLobby = getCurrentLobby(data.toAddress)

    if (targetLobby.lobbyId <= 0) {
      console.log(
        `[SERVER] Target player ${data.toAddress} has no lobby`
      )
      return
    }

    if (targetLobby.gameStarted) {
      console.log(
        `[SERVER] Lobby ${targetLobby.lobbyId} has already started`
      )
      return
    }

    // Don't allow duplicate membership.
    if (
      targetLobby.players.some(
        (player) => player.address === context.from
      )
    ) {
      return
    }

    removePlayerFromAllLobbies(context.from)

    const player = createCafePlayer(context.from)

    if (!player) {
      console.log(
        `[SERVER] Could not create player ${context.from}`
      )
      return
    }

    targetLobby.players.push(player)

    console.log(
      `[SERVER] Player ${context.from} joined lobby ${targetLobby.lobbyId}`
    )

    // Refresh everyone in the lobby.
    sendPlayerListToLobby(targetLobby)
  })

  // -----------------------------------------------
  // START GAME
  // -----------------------------------------------

  room.onMessage('startGame', (_data, context) => {
    if (!context) return

    const lobby = getCurrentLobby(context.from)

    if (lobby.lobbyId <= 0) {
      console.log(
        `[SERVER] ${context.from} tried to start a game without a lobby`
      )
      return
    }

    // AUTHORITATIVE HOST CHECK
    if (lobby.hostAddress !== context.from) {
      console.log(
        `[SERVER] ${context.from} tried to start lobby ${lobby.lobbyId} but is not host`
      )
      return
    }

    if (lobby.gameStarted) {
      console.log(
        `[SERVER] Lobby ${lobby.lobbyId} is already started`
      )
      return
    }

    lobby.gameStarted = true

    console.log(
      `[SERVER] Host ${context.from} started lobby ${lobby.lobbyId}`
    )

    // Tell every member to start.
    for (const player of lobby.players) {
      room.send(
        'gameStarted',
        {
          lobbyId: lobby.lobbyId,
          players: lobby.players
        },
        {
          to: [player.address]
        }
      )
    }
  })

  room.onMessage(
        'playerPosition',
        (data, context) => {
            if (!context) return

            enginePlayerPositions.set(
            context.from,
            data.position
            )
        }
    )
    room.onMessage(
  'takeCustomerOrder',
  (data, context) => {
    if (!context) return

    takeCustomerOrder(
      context.from,
      data.customerId
    )
  }
)

room.onMessage(
  'brewCoffee',
  (data, context) => {
    if (!context) return

    brewCoffee(
      context.from,
      data.drink as 'espresso' | 'cappuccino'
    )
  }
)

room.onMessage(
  'collectSnack',
  (data, context) => {
    if (!context) return

    collectSnack(
      context.from,
      data.snack as 'cupcake' | 'cheesecake'
    )
  }
)

room.onMessage(
  'deliverOrder',
  (data, context) => {
    if (!context) return

    deliverOrder(
      context.from,
      data.customerId
    )
  }
)

room.onMessage(
  'cleanTable',
  (data, context) => {
    if (!context) return

    cleanTable(
      context.from,
      data.tableId
    )
  }
)
let gameSyncTimer = 0

engine.addSystem((dt) => {
  cafeGameSystem(dt)

  gameSyncTimer += dt

  if (gameSyncTimer >= 0.05) {
    gameSyncTimer = 0

    room.send('customerState', {
      customers: getCustomerState()
    })
  }
})
  startGameServer()


}

// --------------------------------------------------
// SERVER GAME LOOP
// --------------------------------------------------

function serverSystem(dt: number) {
  lobbyStateTimer += dt

  // 20 updates per second
  if (lobbyStateTimer < 0.05) {
    return
  }

  lobbyStateTimer = 0

  sendAllLobbyStates()
}

// --------------------------------------------------
// SEND LOBBY POSITIONS
// --------------------------------------------------

function sendAllLobbyStates() {
  for (const lobby of lobbyList) {
    if (!lobby.gameStarted) {
      continue
    }

    if (lobby.players.length === 0) {
      continue
    }

    sendLobbyState(lobby)
  }
}

function sendLobbyState(lobby: CafeLobby) {
  const players = []

  for (const player of lobby.players) {
    const position = getPlayerPosition(player.address)

    if (!position) {
      continue
    }

    players.push({
      address: player.address,
      position
    })
  }

  if (players.length === 0) {
    return
  }

  for (const player of lobby.players) {
    room.send(
      'lobbyState',
      {
        lobbyId: lobby.lobbyId,
        round: lobby.round,
        players
      },
      {
        to: [player.address]
      }
    )
  }
}

// --------------------------------------------------
// GET PLAYER POSITION
// --------------------------------------------------

function getPlayerPosition(
  playerId: string
): Vector3 | null {
  for (const [entity, identity] of engine.getEntitiesWith(
    PlayerIdentityData
  )) {
    if (identity.address !== playerId) {
      continue
    }

    const transform = Transform.getOrNull(entity)

    if (!transform) {
      return null
    }

    return transform.position
  }

  return null
}

// --------------------------------------------------
// CREATE PLAYER
// --------------------------------------------------

function createCafePlayer(
  playerId: string
): CafePlayer | null {
  const playerData = getPlayer({
    userId: playerId
  })

  if (!playerData) {
    return null
  }

  let isGuest = false

  for (const [, identity] of engine.getEntitiesWith(
    PlayerIdentityData
  )) {
    if (identity.address === playerId) {
      isGuest = identity.isGuest
      break
    }
  }

  return {
    address: playerId,
    name: playerData.name,
    isGuest
  }
}

// --------------------------------------------------
// GET CURRENT LOBBY
// --------------------------------------------------

export function getCurrentLobby(
  playerId: string
): CafeLobby {
  const lobby = lobbyList.find((lobby) =>
    lobby.players.some(
      (player) => player.address === playerId
    )
  )

  return (
    lobby ?? {
      lobbyId: 0,
      round: 0,
      hostAddress: '',
      gameStarted: false,
      players: []
    }
  )
}

// --------------------------------------------------
// REMOVE PLAYER
// --------------------------------------------------

function removePlayerFromAllLobbies(
  playerId: string
) {
  for (let i = lobbyList.length - 1; i >= 0; i--) {
    const lobby = lobbyList[i]

    const wasHost =
      lobby.hostAddress === playerId

    lobby.players = lobby.players.filter(
      (player) => player.address !== playerId
    )

    if (lobby.players.length === 0) {
      console.log(
        `[SERVER] Removing empty lobby ${lobby.lobbyId}`
      )

      lobbyList.splice(i, 1)
      continue
    }

    // Transfer host.
    if (wasHost) {
      lobby.hostAddress =
        lobby.players[0].address

      console.log(
        `[SERVER] New host of lobby ${lobby.lobbyId}: ${lobby.hostAddress}`
      )
    }
  }
}

// --------------------------------------------------
// SEND PLAYER LIST
// --------------------------------------------------

function sendPlayerList(playerId: string) {
  const playerList: CafePlayer[] = []

  for (const [, identity] of engine.getEntitiesWith(
    PlayerIdentityData
  )) {
    const playerData = getPlayer({
      userId: identity.address
    })

    if (!playerData) continue

    playerList.push({
      address: identity.address,
      name: playerData.name,
      isGuest: identity.isGuest
    })
  }

  const currentLobby = getCurrentLobby(playerId)

  room.send(
    'playerList',
    {
      players: playerList,
      currentLobby,
      isHost:
        currentLobby.hostAddress === playerId
    },
    {
      to: [playerId]
    }
  )
}

function sendPlayerListToLobby(
  lobby: CafeLobby
) {
  for (const player of lobby.players) {
    sendPlayerList(player.address)
  }
}

// --------------------------------------------------
// LOBBY ID
// --------------------------------------------------

function generateLobbyId(): number {
  let id: number

  do {
    id = Math.floor(
      100000 + Math.random() * 900000
    )
  } while (
    lobbyList.some(
      (lobby) => lobby.lobbyId === id
    )
  )

  return id
}
