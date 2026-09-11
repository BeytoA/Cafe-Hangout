import { room } from 'src'
import { CafePlayer, getCurrentLobby } from 'src/server/server'
import { allPlayersList_set, currentLobby_set, currentPlayerIsHost_set, receivedInvites, receivedInvites_push } from 'src/ui/uiLobbyView'
import { startGame } from 'src/gameLogic'
import { Quaternion, Vector3 } from '@dcl/sdk/math'
import { AvatarModifierArea, AvatarModifierType, engine, InputModifier, MainCamera, MeshRenderer, Transform, VirtualCamera } from '@dcl/sdk/ecs'
import { cafeUiVisible_set } from 'src/ui/ui2D'
import { getPlayer } from '@dcl/sdk/src/players'


export const allPlayersList: CafePlayer[] = []

export type LobbyPlayerState = {
  address: string
  position: {
    x: number
    y: number
    z: number
  }
}

export const currentLobbyPlayers: LobbyPlayerState[] = []

let restrictionActive = false
const cafeZone = {
  minX: 23,
  maxX: 41,
  minZ: 16,
  maxZ: 30
}
function isInsideCafeZone(position: Vector3): boolean {
  return (
    position.x >= cafeZone.minX &&
    position.x <= cafeZone.maxX &&
    position.z >= cafeZone.minZ &&
    position.z <= cafeZone.maxZ
  )
}

const cafeAvatarZone = engine.addEntity()

// PROJECT NOT FINISHED
// DO NOT HIDE OTHERS
AvatarModifierArea.create(cafeAvatarZone, {
  area: Vector3.create(0, 0, 0),
  //area: Vector3.create(18, 20, 14),
  modifiers: [
    AvatarModifierType.AMT_HIDE_AVATARS
  ],
  excludeIds: []
  
})
Transform.create(cafeAvatarZone, {
  position: Vector3.create(32, 10, 23)
})

/*
const cube = engine.addEntity()
MeshRenderer.setBox(cube)
Transform.create(cube, {
  position: Vector3.create(32, 10, 23),
  scale: Vector3.create(18, 20, 14)
})
  */

// Opening, position camera
const cafeCamera = engine.addEntity()
Transform.create(cafeCamera, {
  position: Vector3.create(32, 14, 14),
  rotation: Quaternion.fromEulerDegrees(55, 0, 0)
})
VirtualCamera.create(cafeCamera, {
  //fov: 90
})
function activateCafeCamera() {
  const mainCamera = MainCamera.createOrReplace(engine.CameraEntity, {
    virtualCameraEntity: cafeCamera
  })
}
function deactivateCafeCamera() {
  const mainCamera = MainCamera.getMutable(engine.CameraEntity)
  mainCamera.virtualCameraEntity = undefined
}
function clientSystem(dt: number) {
  const playerPosition = Transform.get(engine.PlayerEntity).position
  const inside = isInsideCafeZone(playerPosition)
  if (inside && !restrictionActive) {
    restrictionActive = true
    
    cafeUiVisible_set(true)
    activateCafeCamera()
    InputModifier.createOrReplace(engine.PlayerEntity, {
      mode: InputModifier.Mode.Standard({
        disableAll: false,
        disableWalk: false,
        disableRun: true,
        disableJog: false,
        disableJump: true,
        disableEmote: true,
        disableDoubleJump: true,
        disableGliding: true
      })
    })
  }

  // Leave cafe
  if (!inside && restrictionActive) {
    restrictionActive = false

    cafeUiVisible_set(false)
    deactivateCafeCamera()
    InputModifier.deleteFrom(engine.PlayerEntity)
  }
}

export function startClient() {
  console.log('[CLIENT] Client started')
  engine.addSystem(clientSystem)

  room.onMessage('playerList', (data) => {
    console.log('[CLIENT] Received player list')

    allPlayersList.length = 0
    allPlayersList.push(...data.players)

    allPlayersList_set(allPlayersList)

    currentLobby_set(data.currentLobby)

    currentPlayerIsHost_set(data.isHost)

    console.log(
      `[CLIENT] Lobby: ${data.currentLobby.lobbyId}`
    )

    console.log(
      `[CLIENT] Host: ${data.currentLobby.hostAddress}`
    )
  })

  room.onMessage('deliverInvitation', (data) => {
    console.log(
      '[CLIENT] Received invitation from ' +
      data.fromAddress
    )

    const alreadyReceived =
      receivedInvites.some(
        (invite) =>
          invite.fromAddress === data.fromAddress
      )

    if (alreadyReceived) {
      console.log(
        '[CLIENT] Invite already exists'
      )

      return
    }

    const playerData =
      allPlayersList.find(
        (player) =>
          player.address === data.fromAddress
      )

    if (!playerData) {
      console.log(
        '[CLIENT] Inviter not found in player list'
      )

      return
    }

    receivedInvites_push({
      fromName: playerData.name,
      fromAddress: data.fromAddress,
      toAddress: ''
    })
  })

  room.onMessage('gameStarted', (data) => {
    console.log(
      `[CLIENT] Server started lobby ${data.lobbyId}`
    )

    const modifier = AvatarModifierArea.getMutable(cafeAvatarZone)

    modifier.excludeIds = data.players.map(
      (player) => player.address.toLowerCase()
    )

    startGame()
  })

  room.onMessage('lobbyState', (data) => {
    currentLobbyPlayers.length = 0

    for (const player of data.players) {
      currentLobbyPlayers.push({
        address: player.address,
        position: player.position
      })
    }
  })

  room.send('joinEmptyLobby', {})

room.onMessage(
  'inventoryUpdate',
  data => {
    console.log(
      '[CLIENT] Inventory:',
      data
    )
  }
)

room.onMessage(
  'scoreUpdate',
  data => {
    console.log(
      `[CLIENT] Score: ${data.score}`
    )
  }
)

room.onMessage(
  'roundComplete',
  data => {
    console.log(
      `[CLIENT] Round ${data.round} starting`
    )
  }
)

room.onMessage(
  'tableCleaned',
  data => {
    console.log(
      `[CLIENT] Table ${data.tableId} cleaned`
    )
  }
)

}
