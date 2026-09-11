import { engine, Schemas } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'
import { room } from '../index'

// ============================================================
// GAME TYPES
// ============================================================

export type CustomerState =
  | 'waiting'
  | 'ordering'
  | 'waitingForOrder'
  | 'eating'
  | 'leaving'
  | 'finished'

export type CoffeeType = 'espresso' | 'cappuccino'
export type FoodType = 'cupcake' | 'cheesecake'

export type CustomerOrder = {
  coffee?: CoffeeType
  food?: FoodType
}

export type CafeCustomer = {
  id: number
  tableId: number
  position: Vector3
  state: CustomerState
  order: CustomerOrder
}

// ============================================================
// TABLES
// ============================================================

type CafeTable = {
  id: number
  position: Vector3
  occupied: boolean
}

const tables: CafeTable[] = [
  {
    id: 1,
    position: Vector3.create(32, 0, 20),
    occupied: false
  },
  {
    id: 2,
    position: Vector3.create(26, 0, 20),
    occupied: false
  },
  {
    id: 3,
    position: Vector3.create(38, 0, 20),
    occupied: false
  }
]

// ============================================================
// GAME STATE
// ============================================================

let customers: CafeCustomer[] = []

let nextCustomerId = 1

let currentRound = 0

let gameStarted = false

let roundTimer = 0

let customerSpawnTimer = 0

let roundDuration = 30

let customerSpawnInterval = 8

// ============================================================
// SERVER START
// ============================================================

export function startGameServer() {
  console.log('[GAME SERVER] Starting game server')

  engine.addSystem(gameLoop)

  console.log('[GAME SERVER] Game loop started')
}

// ============================================================
// START GAME
// ============================================================

export function startGame() {
  if (gameStarted) {
    console.log('[GAME SERVER] Game already started')
    return
  }

  gameStarted = true
  currentRound = 1
  roundTimer = 0
  customerSpawnTimer = 0

  customers.length = 0

  resetTables()

  console.log('[GAME SERVER] Game started')

  broadcastGameState()
}

// ============================================================
// GAME LOOP
// ============================================================

function gameLoop(dt: number) {
  if (!gameStarted) {
    return
  }

  roundTimer += dt
  customerSpawnTimer += dt

  // ----------------------------------------------------------
  // Spawn customers
  // ----------------------------------------------------------

  if (customerSpawnTimer >= customerSpawnInterval) {
    customerSpawnTimer = 0

    spawnCustomer()
  }

  // ----------------------------------------------------------
  // Update customers
  // ----------------------------------------------------------

  updateCustomers(dt)

  // ----------------------------------------------------------
  // End round
  // ----------------------------------------------------------

  if (roundTimer >= roundDuration) {
    startNextRound()
  }
}

// ============================================================
// ROUND MANAGEMENT
// ============================================================

function startNextRound() {
  currentRound++

  roundTimer = 0
  customerSpawnTimer = 0

  console.log(`[GAME SERVER] Starting round ${currentRound}`)

  // Make later rounds harder.
  customerSpawnInterval = Math.max(
    3,
    8 - (currentRound - 1) * 0.75
  )

  roundDuration = 30 + (currentRound - 1) * 5

  broadcastGameState()
}

// ============================================================
// CUSTOMER SPAWNING
// ============================================================

function spawnCustomer() {
  const table = findEmptyTable()

  if (!table) {
    console.log('[GAME SERVER] No empty table available')
    return
  }

  const order = generateRandomOrder()

  const customer: CafeCustomer = {
    id: nextCustomerId++,
    tableId: table.id,
    position: Vector3.create(
      table.position.x,
      table.position.y,
      table.position.z
    ),
    state: 'waiting',
    order
  }

  customers.push(customer)

  table.occupied = true

  console.log(
    `[GAME SERVER] Customer ${customer.id} spawned at table ${table.id}`
  )

  console.log(
    `[GAME SERVER] Order: ${formatOrder(order)}`
  )

  broadcastGameState()
}

// ============================================================
// RANDOM ORDER
// ============================================================

function generateRandomOrder(): CustomerOrder {
  const order: CustomerOrder = {}

  const wantsCoffee = Math.random() < 0.9
  const wantsFood = Math.random() < 0.65

  if (wantsCoffee) {
    order.coffee =
      Math.random() < 0.5
        ? 'espresso'
        : 'cappuccino'
  }

  if (wantsFood) {
    order.food =
      Math.random() < 0.5
        ? 'cupcake'
        : 'cheesecake'
  }

  // Make sure every customer wants at least one thing.
  if (!order.coffee && !order.food) {
    order.coffee = 'espresso'
  }

  return order
}

// ============================================================
// CUSTOMER UPDATE
// ============================================================

function updateCustomers(dt: number) {
  for (const customer of customers) {
    updateCustomer(customer, dt)
  }
}

// ============================================================
// CUSTOMER STATE MACHINE
// ============================================================

function updateCustomer(
  customer: CafeCustomer,
  dt: number
) {
  switch (customer.state) {
    case 'waiting':
      // Customer is waiting for a player to take the order.
      break

    case 'ordering':
      // Later we can add a timer here.
      break

    case 'waitingForOrder':
      // Customer waits for staff to deliver the order.
      break

    case 'eating':
      // Later we can add an eating timer.
      break

    case 'leaving':
      // Later we can move the NPC toward the exit.
      break

    case 'finished':
      break
  }
}

// ============================================================
// TAKE ORDER
// ============================================================

export function takeCustomerOrder(
  customerId: number,
  playerAddress: string
) {
  const customer = customers.find(
    (customer) => customer.id === customerId
  )

  if (!customer) {
    console.log(
      `[GAME SERVER] Customer ${customerId} not found`
    )

    return
  }

  if (customer.state !== 'waiting') {
    console.log(
      `[GAME SERVER] Customer ${customerId} is not waiting`
    )

    return
  }

  console.log(
    `[GAME SERVER] Player ${playerAddress} took order from customer ${customerId}`
  )

  customer.state = 'waitingForOrder'

  broadcastGameState()
}

// ============================================================
// DELIVER ORDER
// ============================================================

export function deliverCustomerOrder(
  customerId: number,
  playerAddress: string,
  coffee?: CoffeeType,
  food?: FoodType
) {
  const customer = customers.find(
    (customer) => customer.id === customerId
  )

  if (!customer) {
    return
  }

  if (customer.state !== 'waitingForOrder') {
    console.log(
      `[GAME SERVER] Customer ${customerId} is not waiting for an order`
    )

    return
  }

  // ----------------------------------------------------------
  // Validate coffee
  // ----------------------------------------------------------

  if (customer.order.coffee) {
    if (coffee !== customer.order.coffee) {
      console.log(
        `[GAME SERVER] Incorrect coffee for customer ${customerId}`
      )

      return
    }
  }

  // ----------------------------------------------------------
  // Validate food
  // ----------------------------------------------------------

  if (customer.order.food) {
    if (food !== customer.order.food) {
      console.log(
        `[GAME SERVER] Incorrect food for customer ${customerId}`
      )

      return
    }
  }

  console.log(
    `[GAME SERVER] Player ${playerAddress} delivered order to customer ${customerId}`
  )

  customer.state = 'eating'

  broadcastGameState()
}

// ============================================================
// FINISH CUSTOMER
// ============================================================

export function finishCustomer(customerId: number) {
  const index = customers.findIndex(
    (customer) => customer.id === customerId
  )

  if (index === -1) {
    return
  }

  const customer = customers[index]

  customer.state = 'finished'

  const table = tables.find(
    (table) => table.id === customer.tableId
  )

  if (table) {
    table.occupied = false
  }

  customers.splice(index, 1)

  console.log(
    `[GAME SERVER] Customer ${customerId} finished`
  )

  broadcastGameState()
}

// ============================================================
// TABLE HELPERS
// ============================================================

function findEmptyTable(): CafeTable | null {
  return (
    tables.find((table) => !table.occupied) ??
    null
  )
}

function resetTables() {
  for (const table of tables) {
    table.occupied = false
  }
}

// ============================================================
// ORDER HELPERS
// ============================================================

function formatOrder(order: CustomerOrder): string {
  const items: string[] = []

  if (order.coffee) {
    items.push(order.coffee)
  }

  if (order.food) {
    items.push(order.food)
  }

  return items.join(' + ')
}

// ============================================================
// GAME STATE BROADCAST
// ============================================================

function broadcastGameState() {
  room.send('gameState', {
    started: gameStarted,
    round: currentRound,
    customers: customers.map((customer) => ({
      id: customer.id,
      tableId: customer.tableId,
      position: customer.position,
      state: customer.state,
      coffee: customer.order.coffee ?? '',
      food: customer.order.food ?? ''
    }))
  })
}

// ============================================================
// GETTERS
// ============================================================

export function isGameStarted() {
  return gameStarted
}

export function getCurrentRound() {
  return currentRound
}

export function getCustomers() {
  return customers
}

export function getTables() {
  return tables
}

// ============================================================
// STOP GAME
// ============================================================

export function stopGame() {
  if (!gameStarted) {
    return
  }

  gameStarted = false

  customers.length = 0

  resetTables()

  currentRound = 0
  roundTimer = 0
  customerSpawnTimer = 0

  console.log('[GAME SERVER] Game stopped')

  broadcastGameState()
}
