import { engine, Transform, AvatarShape } from '@dcl/sdk/ecs'
import { Vector3 } from '@dcl/sdk/math'

const npc = engine.addEntity()

export function startNPC() {

    Transform.create(npc, {
        position: Vector3.create(5, 0, 5)
    })

    AvatarShape.create(npc, {
        id: 'bob',
        name: 'Bob',
        wearables: [],
        emotes: [],
        expressionTriggerId: 'robot'
    })

    let walkTimer = 0
    const walkDuration = 2.0 // retrigger every 1 second

    // system
    engine.addSystem((dt: number) => {

        // Move NPC
        const transform = Transform.getMutable(npc)
        const speed = 2

        transform.position.x += speed * dt

        // Keep triggering Walk animation
        walkTimer += dt

        if (walkTimer >= walkDuration) {

            //AvatarShape.getMutable(npc).expressionTriggerTimestamp =
            //    (AvatarShape.getMutable(npc).expressionTriggerTimestamp ?? 0) + 1

            walkTimer = 0
        }
    })
}