import { Vector3 } from '@dcl/sdk/math'
import { room } from '../index'
import {
  CUSTOMER_EXIT,
  CUSTOMER_SPAWN,
  COFFEE_MACHINES,
  FRIDGES,
  INTERACTION_DISTANCE,
  TABLES
} from '../game/cafeConfig'

export type DrinkType = 'espresso' | 'cappuccino'
export type SnackType = 'cupcake' | 'cheesecake'

export type CustomerState =
  | 'walkingToTable'
  | 'waitingForOrder'
  | 'waitingForFood'
  | 'eating'
  | 'leaving'

export type CafeOrder = {
  drink: DrinkType | ''
  snack: SnackType | ''
}

export type CafeCustomer = {
  id: number
  position: Vector3
  tableId: number
  state: CustomerState
  order: CafeOrder
  ordered: boolean
  eatTimer: number
}

export type PlayerInventory = {
  espresso: number
  cappuccino: number
  cupcake: number
  cheesecake: number
}

type PlayerScore = {
  score: number
  inventory: PlayerInventory
}

export const customers: CafeCustomer[] = []

const playerScores = new Map<string, PlayerScore>()

let nextCustomerId = 1

let currentRound = 1
let roundCustomerTarget = 1
let customersSpawnedThisRound = 0
let roundStarted = false

let spawnTimer = 0
let customerSpawnInterval = 5

function emptyInventory(): PlayerInventory {
  return {
    espresso: 0,
    cappuccino: 0,
    cupcake: 0,
    cheesecake: 0
  }
}

function getPlayerData(address: string): PlayerScore {
  let data = playerScores.get(address)

  if (!data) {
    data = {
      score: 0,
      inventory: emptyInventory()
    }

    playerScores.set(address, data)
  }

  return data
}

export function getPlayerInventory(address: string) {
  return getPlayerData(address).inventory
}

export function getPlayerScore(address: string) {
  return getPlayerData(address).score
}

export function startCafeRound(round: number) {
  currentRound = round
  customersSpawnedThisRound = 0
  roundCustomerTarget = 2 + round
  spawnTimer = 0
  roundStarted = true

  customerSpawnInterval = Math.max(2, 6 - round * 0.5)

  console.log(
    `[SERVER] Starting round ${currentRound}. Target customers: ${roundCustomerTarget}`
  )
}

export function stopCafeGame() {
  roundStarted = false
  customers.length = 0
}

function findTable(tableId: number) {
  return TABLES.find(table => table.id === tableId)
}

function findCustomer(customerId: number) {
  return customers.find(customer => customer.id === customerId)
}

function findEmptyTable() {
  return TABLES.find(table => {
    return !customers.some(customer => customer.tableId === table.id)
  })
}

function generateOrder(): CafeOrder {
  const drink: DrinkType =
    Math.random() < 0.5 ? 'espresso' : 'cappuccino'

  const snack: SnackType | '' =
    Math.random() < 0.5
      ? 'cupcake'
      : 'cheesecake'

  return {
    drink,
    snack
  }
}

function distance(a: Vector3, b: Vector3) {
  return Vector3.distance(a, b)
}

/**
 * Replace this with your authoritative player-position lookup
 * if you already have one in your player synchronization code.
 */
function getPlayerPosition(playerId: string): Vector3 | null {
  const player = Array.from(
    enginePlayerPositions.entries()
  ).find(([address]) => address === playerId)

  return player ? player[1] : null
}

/**
 * Server receives player positions from clients.
 *
 * The server should update these from your existing player
 * position synchronization system.
 */
export const enginePlayerPositions = new Map<string, Vector3>()

function isPlayerNear(
  playerId: string,
  position: Vector3
) {
  const playerPosition = getPlayerPosition(playerId)

  if (!playerPosition) {
    return false
  }

  return distance(playerPosition, position) <= INTERACTION_DISTANCE
}

function spawnCustomer() {
  const table = findEmptyTable()

  if (!table) {
    return false
  }

  const customer: CafeCustomer = {
    id: nextCustomerId++,
    position: Vector3.clone(CUSTOMER_SPAWN),
    tableId: table.id,
    state: 'walkingToTable',
    order: generateOrder(),
    ordered: false,
    eatTimer: 0
  }

  customers.push(customer)

  console.log(
    `[SERVER] Customer ${customer.id} spawned for table ${table.id}`
  )

  return true
}

function moveCustomer(
  customer: CafeCustomer,
  target: Vector3,
  dt: number
) {
  const speed = 2.5

  const dx = target.x - customer.position.x
  const dy = target.y - customer.position.y
  const dz = target.z - customer.position.z

  const length = Math.sqrt(
    dx * dx +
    dy * dy +
    dz * dz
  )

  if (length < 0.05) {
    customer.position = Vector3.clone(target)
    return true
  }

  const amount = Math.min(
    speed * dt,
    length
  )

  customer.position = Vector3.create(
    customer.position.x + dx / length * amount,
    customer.position.y + dy / length * amount,
    customer.position.z + dz / length * amount
  )

  return false
}

function updateCustomers(dt: number) {
  for (const customer of customers) {
    if (customer.state === 'walkingToTable') {
      const table = findTable(customer.tableId)

      if (!table) continue

      const arrived = moveCustomer(
        customer,
        table.customerPosition,
        dt
      )

      if (arrived) {
        customer.state = 'waitingForOrder'

        console.log(
          `[SERVER] Customer ${customer.id} is waiting for order`
        )
      }
    }

    else if (customer.state === 'eating') {
      customer.eatTimer -= dt

      if (customer.eatTimer <= 0) {
        customer.state = 'leaving'
      }
    }

    else if (customer.state === 'leaving') {
      const arrived = moveCustomer(
        customer,
        CUSTOMER_EXIT,
        dt
      )

      if (arrived) {
        console.log(
          `[SERVER] Customer ${customer.id} left`
        )

        const index = customers.indexOf(customer)

        if (index !== -1) {
          customers.splice(index, 1)
        }
      }
    }
  }
}

export function cafeGameSystem(dt: number) {
  if (!roundStarted) {
    return
  }

  updateCustomers(dt)

  if (
    customersSpawnedThisRound <
    roundCustomerTarget
  ) {
    spawnTimer -= dt

    if (spawnTimer <= 0) {
      if (spawnCustomer()) {
        customersSpawnedThisRound++
      }

      spawnTimer = customerSpawnInterval
    }
  }

  if (
    customersSpawnedThisRound >=
      roundCustomerTarget &&
    customers.length === 0
  ) {
    roundStarted = false

    currentRound++

    console.log(
      `[SERVER] Round complete. Next round: ${currentRound}`
    )

    room.send('roundComplete', {
      round: currentRound
    })
  }
}

export function takeCustomerOrder(
  playerId: string,
  customerId: number
) {
  const customer = findCustomer(customerId)

  if (!customer) return false

  if (
    customer.state !==
    'waitingForOrder'
  ) {
    return false
  }

  if (
    !isPlayerNear(
      playerId,
      customer.position
    )
  ) {
    console.log(
      `[SERVER] ${playerId} is too far from customer`
    )

    return false
  }

  customer.ordered = true
  customer.state = 'waitingForFood'

  room.send(
    'customerOrder',
    {
      customerId: customer.id,
      drink: customer.order.drink,
      snack: customer.order.snack
    },
    {
      to: [playerId]
    }
  )

  return true
}

function isNearAny(
  playerId: string,
  positions: Vector3[]
) {
  return positions.some(position =>
    isPlayerNear(playerId, position)
  )
}

export function brewCoffee(
  playerId: string,
  drink: DrinkType
) {
  if (
    !isNearAny(
      playerId,
      COFFEE_MACHINES
    )
  ) {
    return false
  }

  const inventory =
    getPlayerInventory(playerId)

  if (drink === 'espresso') {
    inventory.espresso++
  }

  if (drink === 'cappuccino') {
    inventory.cappuccino++
  }

  sendInventory(playerId)

  return true
}

export function collectSnack(
  playerId: string,
  snack: SnackType
) {
  if (
    !isNearAny(
      playerId,
      FRIDGES
    )
  ) {
    return false
  }

  const inventory =
    getPlayerInventory(playerId)

  if (snack === 'cupcake') {
    inventory.cupcake++
  }

  if (snack === 'cheesecake') {
    inventory.cheesecake++
  }

  sendInventory(playerId)

  return true
}

export function deliverOrder(
  playerId: string,
  customerId: number
) {
  const customer =
    findCustomer(customerId)

  if (!customer) return false

  if (
    customer.state !==
    'waitingForFood'
  ) {
    return false
  }

  if (
    !isPlayerNear(
      playerId,
      customer.position
    )
  ) {
    return false
  }

  const inventory =
    getPlayerInventory(playerId)

  const order =
    customer.order

  if (
    order.drink === 'espresso' &&
    inventory.espresso < 1
  ) {
    return false
  }

  if (
    order.drink === 'cappuccino' &&
    inventory.cappuccino < 1
  ) {
    return false
  }

  if (
    order.snack === 'cupcake' &&
    inventory.cupcake < 1
  ) {
    return false
  }

  if (
    order.snack === 'cheesecake' &&
    inventory.cheesecake < 1
  ) {
    return false
  }

  if (order.drink === 'espresso') {
    inventory.espresso--
  }

  if (order.drink === 'cappuccino') {
    inventory.cappuccino--
  }

  if (order.snack === 'cupcake') {
    inventory.cupcake--
  }

  if (order.snack === 'cheesecake') {
    inventory.cheesecake--
  }

  const player =
    getPlayerData(playerId)

  player.score += 100

  customer.state = 'eating'
  customer.eatTimer = 5

  sendInventory(playerId)
  sendScore(playerId)

  return true
}

export function cleanTable(
  playerId: string,
  tableId: number
) {
  const table = findTable(tableId)

  if (!table) return false

  if (
    customers.some(
      customer =>
        customer.tableId === tableId
    )
  ) {
    return false
  }

  if (
    !isPlayerNear(
      playerId,
      table.position
    )
  ) {
    return false
  }

  room.send(
    'tableCleaned',
    {
      tableId
    }
  )

  return true
}

export function sendInventory(
  playerId: string
) {
  const inventory =
    getPlayerInventory(playerId)

  room.send(
    'inventoryUpdate',
    {
      espresso: inventory.espresso,
      cappuccino: inventory.cappuccino,
      cupcake: inventory.cupcake,
      cheesecake: inventory.cheesecake
    },
    {
      to: [playerId]
    }
  )
}

export function sendScore(
  playerId: string
) {
  room.send(
    'scoreUpdate',
    {
      score: getPlayerScore(playerId)
    },
    {
      to: [playerId]
    }
  )
}

export function getCustomerState() {
  return customers.map(customer => ({
    id: customer.id,
    position: customer.position,
    tableId: customer.tableId,
    state: customer.state
  }))
}
