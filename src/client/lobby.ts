import { getPlayer } from "@dcl/sdk/src/players"
import { room } from "src"
import { lobbyRefreshIndicator_progress, receivedInvites_remove } from "src/ui/uiLobbyView"

const LOBBY_REFRESH_TIME = 1.0
let LOBBY_REFRESH_ELAPSED = LOBBY_REFRESH_TIME

export function lobbyViewSystem(dt: number) {
    if (LOBBY_REFRESH_ELAPSED <= 0) {
        room.send("getPlayerList", {})
        console.log("[CLIENT] Requested player list")
        lobbyRefreshIndicator_progress()
        LOBBY_REFRESH_ELAPSED = LOBBY_REFRESH_TIME
    }
    LOBBY_REFRESH_ELAPSED -= dt
}

export function invitePlayer(val: string) {
    const player = getPlayer()
    if (!player) return

    if (val == player.userId) {
        console.log("[CLIENT] You can not invite yourself")
    }
    else{
        console.log("[CLIENT] Invite player " + val)
        room.send("invitePlayer", { toAddress: val, fromAddress: player.userId } )
    }
}

export function acceptInvite(val: string) {
    console.log("[CLIENT] Accept invite from " + val)
    receivedInvites_remove(val)
    room.send("joinPlayer", { toAddress: val} )
}