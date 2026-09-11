import { Vector3 } from '@dcl/sdk/math'

export const TABLES = [
  {
    id: 1,
    position: Vector3.create(32, 0, 20),
    customerPosition: Vector3.create(32, 0, 18.3)
  },
  {
    id: 2,
    position: Vector3.create(26, 0, 20),
    customerPosition: Vector3.create(26, 0, 18.3)
  },
  {
    id: 3,
    position: Vector3.create(38, 0, 20),
    customerPosition: Vector3.create(38, 0, 18.3)
  }
]

export const COFFEE_MACHINES = [
  Vector3.create(34, 1.2, 28),
  Vector3.create(31.5, 1.2, 28)
]

export const FRIDGES = [
  Vector3.create(29, 1.3, 28),
  Vector3.create(36.5, 1.3, 28)
]

export const FURNACE = Vector3.create(26.5, 1.3, 28)

export const CUSTOMER_SPAWN = Vector3.create(40, 0, 16)

export const CUSTOMER_EXIT = Vector3.create(40, 0, 16)

export const INTERACTION_DISTANCE = 2.5
