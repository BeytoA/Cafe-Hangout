import { Quaternion, Vector2, Vector3 } from '@dcl/sdk/math'
import { engine, GltfContainer, InputModifier, MainCamera, Transform, VirtualCamera } from '@dcl/sdk/ecs'

import { setupUi } from './ui'
import { ReactEcsRenderer } from '@dcl/sdk/react-ecs'
import { uiMain, uiProjectNotFinished } from './ui/ui2D'
import { movePlayerTo } from '~system/RestrictedActions'
import { isServer, registerMessages } from '@dcl/sdk/network'
import { CafePlayer, Messages, startServer } from './server/server'
import { allPlayersList_set, PlayerInvite } from './ui/uiLobbyView'
import { showLobbyView } from './gameLogic'
import { getPlayer } from '@dcl/sdk/src/players'
import { startClient } from './client/client'


export const room = registerMessages(Messages)

export function main() {
  // PROJECT NOT FINISHED
  // JUST DISABLE UI
  //ReactEcsRenderer.setUiRenderer(uiMain, { virtualWidth: 1920, virtualHeight: 1080})
  ReactEcsRenderer.setUiRenderer(uiProjectNotFinished, { virtualWidth: 1920, virtualHeight: 1080})

  LoadShopModels()

  if (isServer()) {
    startServer()
  }
  else {
    startClient()
  }
}

function LoadShopModels() {
  // Building
  const shopModel = engine.addEntity()

  GltfContainer.create(shopModel, {
    src: 'assets/models/shop-model.glb'
  })

  Transform.create(shopModel, {
    position: Vector3.create(23.7, 0, 16.5),
  })

  // Tables
  let tableCoords = [ 
    Vector3.create(32, 0, 20),
    Vector3.create(26, 0, 20),
    Vector3.create(38, 0, 20)
  ]
  tableCoords.forEach(coord => {
    const tableModel = engine.addEntity()
    GltfContainer.create(tableModel, {
      src: 'assets/models/furniture-table.glb'
    })
    Transform.create(tableModel, {
      position: coord,
    })
  });

  // Bars
  let barsTransforms: [Vector3, Quaternion][] = [ 
    [Vector3.create(39, 0, 23.5), Quaternion.fromEulerDegrees(0, 0, 0,)],
    [Vector3.create(36.5, 0, 23.5), Quaternion.fromEulerDegrees(0, 0, 0)],
    [Vector3.create(34, 0, 23.5), Quaternion.fromEulerDegrees(0, 0, 0)],
    //[Vector3.create(31.5, 0, 23.5), Quaternion.fromEulerDegrees(0, 0, 0)],
    [Vector3.create(29, 0, 23.5), Quaternion.fromEulerDegrees(0, 0, 0)],
    [Vector3.create(26.5, 0, 23.5), Quaternion.fromEulerDegrees(0, 0, 0)],
    [Vector3.create(24.7, 0, 24.2), Quaternion.fromEulerDegrees(0, 90, 0)],
    [Vector3.create(24.7, 0, 26.7), Quaternion.fromEulerDegrees(0, 90, 0)]
  ]
  barsTransforms.forEach(transf => {
    const barModel = engine.addEntity()
    GltfContainer.create(barModel, {
      src: 'assets/models/furniture-bar.glb'
    })
    Transform.create(barModel, {
      position: transf[0],
      rotation: transf[1]
    })
  });

  // Counters
  let countersCoords = [ 
    Vector3.create(39, 0, 28),
    Vector3.create(36.5, 0, 28),
    Vector3.create(34, 0, 28),
    Vector3.create(31.5, 0, 28),
    Vector3.create(29, 0, 28),
    Vector3.create(26.5, 0, 28)
  ]
  countersCoords.forEach(coord => {
    const counterModel = engine.addEntity()
    GltfContainer.create(counterModel, {
      src: 'assets/models/furniture-counter.glb'
    })
    Transform.create(counterModel, {
      position: coord,
    })
  });

  // Machines
  let machinesCoords = [ 
    Vector3.create(34, 1.2, 28),
    Vector3.create(31.5, 1.2, 28)
  ]
  machinesCoords.forEach(coord => {
    const machineModel = engine.addEntity()
    GltfContainer.create(machineModel, {
      src: 'assets/models/furniture-machine.glb'
    })
    Transform.create(machineModel, {
      position: coord,
    })
  });

  // Fridges
  let fridgesCoords = [ 
    Vector3.create(29, 1.3, 28),
    Vector3.create(36.5, 1.3, 28)
  ]
  fridgesCoords.forEach(coord => {
    const fridgeModel = engine.addEntity()
    GltfContainer.create(fridgeModel, {
      src: 'assets/models/furniture-fridge.glb'
    })
    Transform.create(fridgeModel, {
      position: coord,
    })
  });

  // Furnace
  let furnaceCoords = [ 
    Vector3.create(26.5, 1.3, 28)
  ]
  furnaceCoords.forEach(coord => {
    const furnaceModel = engine.addEntity()
    GltfContainer.create(furnaceModel, {
      src: 'assets/models/furniture-furnace.glb'
    })
    Transform.create(furnaceModel, {
      position: coord,
    })
  });
}