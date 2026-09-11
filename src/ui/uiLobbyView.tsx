import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { UiEntity } from '@dcl/sdk/react-ecs'

import { room } from 'src'

import {
  acceptInvite,
  invitePlayer
} from 'src/client/lobby'

import {
  CafeLobby,
  CafePlayer
} from 'src/server/server'

// --------------------------------------------------
// STATE
// --------------------------------------------------

let UiLobbyListHeight:
  | '100%'
  | '0px' = '0px'

let allPlayersList:
  CafePlayer[] = []

let lobbyRefreshIndicator = '...'

let currentLobby: CafeLobby = {
  lobbyId: 0,
  round: 0,
  hostAddress: '',
  gameStarted: false,
  players: []
}

let currentPlayerIsHost = false

// --------------------------------------------------
// SETTERS
// --------------------------------------------------

export function UiLobbyListHeight_set(
  val: '100%' | '0px'
) {
  UiLobbyListHeight = val
}

export function allPlayersList_set(
  val: CafePlayer[]
) {
  allPlayersList = val
}

export function currentLobby_set(
  val: CafeLobby
) {
  currentLobby = val

  console.log(
    `[CLIENT] Current lobby: ${val.lobbyId}`
  )

  console.log(
    `[CLIENT] Host: ${val.hostAddress}`
  )
}

export function currentPlayerIsHost_set(
  val: boolean
) {
  currentPlayerIsHost = val

  console.log(
    `[CLIENT] Is host: ${val}`
  )
}

export function lobbyRefreshIndicator_progress() {
  lobbyRefreshIndicator += '.'

  if (lobbyRefreshIndicator.length > 3) {
    lobbyRefreshIndicator = '.'
  }
}

// --------------------------------------------------
// INVITES
// --------------------------------------------------

export type PlayerInvite = {
  fromName: string
  fromAddress: string
  toAddress: string
}

export let receivedInvites:
  PlayerInvite[] = []

export function receivedInvites_push(
  val: PlayerInvite
) {
  receivedInvites.push(val)

  console.log(
    '[CLIENT] Update received invites'
  )
}

export function receivedInvites_remove(
  fromAddress: string
) {
  const index =
    receivedInvites.findIndex(
      (invite) =>
        invite.fromAddress === fromAddress
    )

  if (index !== -1) {
    receivedInvites.splice(index, 1)

    console.log(
      '[CLIENT] Invite removed'
    )
  }
}

// --------------------------------------------------
// SHOW INVITES
// --------------------------------------------------

export function showInvites() {
  return receivedInvites.map(
    (invite) => (
      <UiEntity
        key={invite.fromAddress}
        uiTransform={{
          width: '100%',
          height: '30px',
          margin: {
            bottom: '10px',
            left: '20px'
          },
          overflow: 'hidden',
          justifyContent: 'flex-end'
        }}
        uiText={{
          value:
            `- ${invite.fromName.slice(0, 30)} `,
          fontSize: 20,
          textAlign: 'middle-left',
          textWrap: 'nowrap'
        }}
      >
        <UiEntity
          uiTransform={{
            width: '50%',
            height: '30px',
            margin: {
              right: '20px'
            }
          }}
        >
          <UiEntity
            uiTransform={{
              width: '100%',
              height: '30px'
            }}
            uiBackground={{
              color:
                Color4.fromInts(
                  40,
                  40,
                  200,
                  200
                )
            }}
            uiText={{
              value: 'Accept Invite',
              fontSize: 20,
              textAlign: 'middle-center'
            }}
            onMouseDown={() => {
              acceptInvite(
                invite.fromAddress
              )
            }}
          />
        </UiEntity>
      </UiEntity>
    )
  )
}

// --------------------------------------------------
// CURRENT LOBBY PLAYERS
// --------------------------------------------------

export function showLobbyPlayers() {
  return currentLobby.players.map(
    (player) => (
      <UiEntity
        key={player.address}
        uiTransform={{
          width: '100%',
          height: '30px',
          margin: {
            bottom: '5px',
            left: '20px'
          }
        }}
        uiText={{
          value: `- ${player.name}`,
          fontSize: 20,
          textAlign: 'middle-left'
        }}
      />
    )
  )
}

// --------------------------------------------------
// ALL PLAYERS
// --------------------------------------------------

export function showAllPlayers() {
  return allPlayersList.map(
    (player) => (
      <UiEntity
        key={player.address}
        uiTransform={{
          width: '100%',
          height: '30px',
          margin: {
            bottom: '10px'
          },
          overflow: 'hidden',
          justifyContent: 'flex-end'
        }}
        uiText={{
          value:
            `- ${player.name.slice(0, 30)} `,
          fontSize: 20,
          textAlign: 'middle-left',
          textWrap: 'nowrap'
        }}
      >
        <UiEntity
          uiTransform={{
            width: '25%',
            height: '30px',
            margin: {
              right: '20px'
            }
          }}
        >
          <UiEntity
            uiTransform={{
              width: '100%',
              height: '30px'
            }}
            uiBackground={{
              color:
                Color4.fromInts(
                  40,
                  200,
                  40,
                  200
                )
            }}
            uiText={{
              value: 'Invite',
              fontSize: 20,
              textAlign: 'middle-center'
            }}
            onMouseDown={() => {
              invitePlayer(
                player.address
              )
            }}
          />
        </UiEntity>
      </UiEntity>
    )
  )
}

// --------------------------------------------------
// LOBBY UI
// --------------------------------------------------

export const UiLobbyList = () => (
  <UiEntity
    uiTransform={{
      width: '100%',
      height: UiLobbyListHeight,
      overflow: 'hidden',
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <UiEntity
      uiTransform={{
        width: '1069px',
        height: '500px'
      }}
      uiBackground={{
        color:
          Color4.fromInts(
            255,
            255,
            255,
            250
          ),
        textureMode: 'stretch',
        texture: {
          src:
            'assets/ui/background_popupbig-light.png'
        }
      }}
    >
      {/* ------------------------------------------ */}
      {/* LEFT SIDE */}
      {/* ------------------------------------------ */}

      <UiEntity
        uiTransform={{
          width: '50%',
          height: '100%',
          flexDirection: 'column'
        }}
      >
        {/* ---------------------------------------- */}
        {/* LEFT TOP */}
        {/* ---------------------------------------- */}

        <UiEntity
          uiTransform={{
            width: '100%',
            height: '50%',
            flexDirection: 'column'
          }}
        >
          {/* Title */}

          <UiEntity
            uiTransform={{
              width: 'auto',
              height: 'auto',
              margin: {
                top: '55px',
                left: '20px'
              }
            }}
            uiText={{
              value:
                'Current lobby: ' +
                lobbyRefreshIndicator,
              fontSize: 20,
              textAlign: 'middle-left'
            }}
          />

          {showLobbyPlayers()}

          {/* Lobby Controls */}

          <UiEntity
            uiTransform={{
              width: 'auto',
              height: 'auto',
              justifyContent: 'center'
            }}
          >
            {/* Leave */}

            <UiEntity
              uiTransform={{
                width: 'auto',
                height: 'auto',
                alignSelf: 'center'
              }}
              uiBackground={{
                color:
                  Color4.fromInts(
                    255,
                    50,
                    50,
                    200
                  )
              }}
              uiText={{
                value: 'Leave Lobby',
                fontSize: 20
              }}
              onMouseDown={() => {
                console.log(
                  '[CLIENT] Leave lobby'
                )

                room.send(
                  'joinEmptyLobby',
                  {}
                )
              }}
            />

            {/* Start */}

            {currentPlayerIsHost &&
              !currentLobby.gameStarted && (
                <UiEntity
                  uiTransform={{
                    width: 'auto',
                    height: 'auto',
                    margin: {
                      left: '20px'
                    },
                    alignSelf: 'center'
                  }}
                  uiBackground={{
                    color:
                      Color4.fromInts(
                        40,
                        200,
                        40,
                        200
                      )
                  }}
                  uiText={{
                    value: 'Start Game',
                    fontSize: 20
                  }}
                  onMouseDown={() => {
                    console.log(
                      '[CLIENT] Requesting game start'
                    )

                    room.send(
                      'startGame',
                      {}
                    )
                  }}
                />
              )}
          </UiEntity>
        </UiEntity>

        {/* ---------------------------------------- */}
        {/* LEFT BOTTOM */}
        {/* ---------------------------------------- */}

        <UiEntity
          uiTransform={{
            width: '100%',
            height: '48%',
            flexDirection: 'column',
            overflow: 'scroll'
          }}
        >
          <UiEntity
            uiTransform={{
              width: '100%',
              height: 'auto',
              margin: {
                top: '10px',
                left: '20px'
              }
            }}
            uiText={{
              value:
                'Invites: ' +
                lobbyRefreshIndicator,
              fontSize: 20,
              textAlign: 'middle-left'
            }}
          />

          {showInvites()}
        </UiEntity>
      </UiEntity>

      {/* ------------------------------------------ */}
      {/* RIGHT SIDE */}
      {/* ------------------------------------------ */}

      <UiEntity
        uiTransform={{
          width: '50%',
          height: '100%',
          flexDirection: 'column'
        }}
      >
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 'auto',
            margin: {
              top: '55px',
              left: '20px'
            }
          }}
          uiText={{
            value:
              'All Players: ' +
              lobbyRefreshIndicator,
            fontSize: 20
          }}
        />

        {showAllPlayers()}
      </UiEntity>
    </UiEntity>
  </UiEntity>
)
