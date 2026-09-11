import { AvatarShape, engine } from "@dcl/sdk/ecs";

function spawnNPC(outfit: number, order: string[]) {
    // Order time will be calculated automatically
    // depending on the complexy of the order
    // Maybe show a clock on top of customers
    // to indicate left time?

    const npc = engine.addEntity()

    AvatarShape.create(npc, {
        id: 'bob',
        name: 'Bob',
        wearables: [],
        emotes: [],
        expressionTriggerId: 'robot'
    })
}