import { Vector3 } from '@dcl/sdk/math'
import { movePlayerTo } from '~system/RestrictedActions'
import { engine } from '@dcl/sdk/ecs'
import {
  UiGameHeight_set,
  UiHomeHeight_set
} from './ui/ui2D'
import {
  UiLobbyListHeight_set
} from './ui/uiLobbyView'
import {
  lobbyViewSystem
} from './client/lobby'
import { room } from './index'

let gameStarted = false

export function startGame() {
  UiLobbyListHeight_set('0px')
  UiGameHeight_set('100%')

  movePlayerTo({
    newRelativePosition:
      Vector3.create(
        31.5,
        0.1,
        24
      ),
    cameraTarget:
      Vector3.create(
        31.5,
        2,
        16
      )
  })

  engine.removeSystem(
    lobbyViewSystem
  )

  gameStarted = true
}

export function showLobbyView() {
  UiHomeHeight_set('0px')
  UiGameHeight_set('0px')
  UiLobbyListHeight_set('100%')

  engine.addSystem(
    lobbyViewSystem
  )
}

export function isGameStarted() {
  return gameStarted
}

export function startGameLogic() {
  
}

export function setupGameMessages() {
  room.onMessage(
    'gameStarted',
    data => {
    console.log(
      `[CLIENT] Game started. Lobby ${data.lobbyId}`
    )

      startGame()
    }
  )
}
