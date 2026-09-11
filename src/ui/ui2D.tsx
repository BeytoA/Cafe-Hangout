import { ReactEcs, UiEntity } from "@dcl/sdk/react-ecs";
import { Color4 } from "@dcl/sdk/math";
import { getPlayer } from '@dcl/sdk/src/players'
import { showLobbyView, startGame } from "../gameLogic";
import { room } from "src";
import { CafePlayer } from "../server/server";
import { UiLobbyList } from "./uiLobbyView";

let playButtonX = 0
let UiHomeHeight: '100%' | '0px' = '100%'
let UiGameHeight: '100%' | '0px' = '0px'

export function UiHomeHeight_set(val: any) {
    UiHomeHeight = val
}
export function UiGameHeight_set(val: any) {
    UiGameHeight = val
}

const UiHome_TopButtons = () => (
    <UiEntity
        uiTransform={{
            //width: 100,
            height: 120,
            justifyContent: "flex-end",
            alignItems: 'center'
        }}
        //uiBackground={{color: Color4.fromInts(0, 0, 0, 255*0.8) }}
    >
        {/*Mute button*/}
        <UiEntity
            uiTransform={{
                width: 271*0.8,
                height: 86*0.8,
                margin: { top: '20px', right: '10px', bottom: '10px', left: '10px'}
            }}
            uiBackground={{
                textureMode: 'stretch',
                texture: { src: 'assets/ui/button_muted.png'}
            }}
        />

        {/*Info button*/}
        <UiEntity
            uiTransform={{
                width: 204*0.8,
                height: 86*0.8,
                margin: { top: '20px', right: '10px', bottom: '10px', left: '10px'}
            }}
            uiBackground={{
                textureMode: 'stretch',
                texture: { src: 'assets/ui/button_info.png'}
            }}
        />
    </UiEntity>
)

const UiHome_CenterButtons = () => (
    <UiEntity
        uiTransform={{
            //width: 100,
            height: "auto",
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            flexGrow: 2
        }}
        //uiBackground={{color: Color4.Green() }}
    >
        {/*Logo*/}
        <UiEntity
            uiTransform={{
                width: 917*0.5,
                height: 653*0.5,
                margin: { top: '10px', right: '10px', bottom: '40px', left: '10px'}
            }}
            uiBackground={{
                textureMode: 'stretch',
                color: Color4.fromInts(255, 255, 255, 255),
                texture: { src: 'assets/ui/logo_caferushtogether(2).png'}
            }}
        />

        {/*Horizontal bar*/}
        <UiEntity
            uiTransform={{
                //width: 100,
                height: "auto",
                justifyContent: "center",
                margin: { bottom: '60px' }
            }}
            //uiBackground={{color: Color4.Green() }}
        >
            {/*Play button*/}
            <UiEntity
                uiTransform={{
                    width: 221,
                    height: 92,
                    margin: { top: '10px', right: `${playButtonX}px`, bottom: '10px', left: '10px'}
                }}
                uiBackground={{
                    textureMode: 'center',
                    texture: { src: 'assets/ui/button_play.png'}
                }}
                onMouseDown={() => {
                    showLobbyView()
                }}
            />

            {/*Play Together button*/}
            <UiEntity
                uiTransform={{
                    width: 295,
                    height: 97,
                    margin: { top: '10px', right: '10px', bottom: '10px', left: '10px'}
                }}
                uiBackground={{
                    textureMode: 'center',
                    texture: { src: 'assets/ui/button_playtogether.png'}
                }}
                onMouseDown={() => {
                    showLobbyView()
                }}
            />
        </UiEntity>
    </UiEntity>
)
const UiHome = () => (
    <UiEntity
        uiTransform={{
            width: '100%', 
            height: UiHomeHeight, 
            //margin: {top: '50px', left: '50px'},
            flexDirection: 'column',
            overflow: 'hidden'
        }}
        //uiBackground={{color: Color4.Red() }}
    >
        <UiHome_TopButtons />
        <UiHome_CenterButtons />
    </UiEntity>
)

const UiGame_TopBar = () => (
            <UiEntity
                uiTransform={{
                    width: '100%', 
                    height: '100px', 
                    //margin: {top: '0px', right: '50px'},
                    justifyContent: 'flex-end'
                }}
                //uiBackground={{color: Color4.fromInts(255, 0, 0, 80) }}
            >
                
                {/*Mute button*/}
                <UiEntity
                    uiTransform={{
                        width: 153*0.8,
                        height: 90*0.8,
                        margin: { top: '10px', right: '10px', bottom: '10px', left: '10px'}
                    }}
                    uiBackground={{
                        textureMode: 'stretch',
                        texture: { src: 'assets/ui/button_muted-notext.png'}
                    }}
                />

                {/*Help button*/}
                <UiEntity
                    uiTransform={{
                        width: 163*0.5,
                        height: 160*0.5,
                        margin: { top: '10px', right: '10px', bottom: '10px', left: '10px'}
                    }}
                    uiBackground={{
                        textureMode: 'stretch',
                        texture: { src: 'assets/ui/button_info-notext.png'}
                    }}
                />

                {/*Pause button*/}
                <UiEntity
                    uiTransform={{
                        width: 164*0.5,
                        height: 161*0.5,
                        margin: { top: '10px', right: '10px', bottom: '10px', left: '10px'}
                    }}
                    uiBackground={{
                        textureMode: 'stretch',
                        texture: { src: 'assets/ui/button_pause.png'}
                    }}
                />
            </UiEntity>
)

const UiGame_LeftBar = () => (
        <UiEntity
            uiTransform={{
                width: '100px', 
                height: '100%', 
                margin: {top: '0px', left: '0px'},
                flexDirection: 'column',
                justifyContent: 'center',
            }}
            //uiBackground={{color: Color4.fromInts(255, 0, 0, 80) }}
        >
            {/*Waiting Client Background*/}
            <UiEntity
                uiTransform={{
                    width: 245*0.8,
                    height: 91*0.8,
                    margin: { top: '0px', right: '10px', bottom: '0px', left: '55px'},
                    alignItems: 'center'
                }}
                uiBackground={{
                    textureMode: 'stretch',
                    texture: { src: 'assets/ui/background_leftitem.png'}
                }}
            >
                {/*Waiting Client Icon*/}
                <UiEntity
                    uiTransform={{
                        width: 188*0.3,
                        height: 168*0.3,
                        margin: { top: '0px', right: '10px', bottom: '0px', left: '10px'}
                    }}
                    uiBackground={{
                        textureMode: 'stretch',
                        texture: { src: 'assets/ui/icon_clientwaiting.png'}
                    }}
                />
                {/*Waiting Client Text*/}
                <UiEntity
                    uiText={{
                        value: "Waiting: 0",
                        fontSize: 20,
                    }}
                />
            </UiEntity>

            {/*Dishes Background*/}
            <UiEntity
                uiTransform={{
                    width: 245*0.8,
                    height: 91*0.8,
                    margin: { top: '0px', right: '10px', bottom: '100px', left: '55px'},
                    alignItems: 'center'
                }}
                uiBackground={{
                    textureMode: 'stretch',
                    texture: { src: 'assets/ui/background_leftitem.png'}
                }}
            >
                {/*Dishes Icon*/}
                <UiEntity
                    uiTransform={{
                        width: 188*0.3,
                        height: 168*0.3,
                        margin: { top: '0px', right: '10px', bottom: '0px', left: '10px'}
                    }}
                    uiBackground={{
                        textureMode: 'stretch',
                        texture: { src: 'assets/ui/icon_dishes.png'}
                    }}
                />
                {/*Dishes Text*/}
                <UiEntity
                    uiText={{
                        value: "Dishes: 0",
                        fontSize: 20,
                    }}
                />
            </UiEntity>
        </UiEntity>
)

const UiGame_RightBar = () => (
    <UiEntity
        uiTransform={{
            width: '20px', 
            height: '100%', 
            //margin: {top: '0px', right: '50px'},
            flexDirection: 'column',
            justifyContent: 'center',
        }}
        //uiBackground={{color: Color4.fromInts(255, 255, 0, 255) }}
    >
        {/*Time Background*/}
        <UiEntity
            uiTransform={{
                width: 310*0.8,
                height: 89*0.8,
                position: { right: `${310*0.8}px` },
                alignItems: 'center'
            }}
            uiBackground={{
                textureMode: 'stretch',
                texture: { src: 'assets/ui/background_time.png'}
            }}
        >
            {/*Time Text*/}
            <UiEntity
                uiTransform={{
                    margin: { left: '70px' }
                }}
                uiText={{
                    value: "Closing in: 00:30",
                    fontSize: 20,
                }}
            />
        </UiEntity>

        {/*Earnings Background*/}
        <UiEntity
            uiTransform={{
                width: 310*0.8,
                height: 89*0.8,
                position: { right: `${310*0.8}px` },
                margin: { bottom: '100px' },
                alignItems: 'center'
            }}
            uiBackground={{
                textureMode: 'stretch',
                texture: { src: 'assets/ui/background_earnings.png'}
            }}
        >
            {/*Earnings Text*/}
            <UiEntity
                uiTransform={{
                    margin: { left: '70px' }
                }}
                uiText={{
                    value: "Earnings: 30",
                    fontSize: 20,
                }}
            />
        </UiEntity>
    </UiEntity>
)

function getPlayerPos() {
    let thePlayer = getPlayer()

    if(thePlayer && thePlayer.position) {
        return thePlayer.position.x.toFixed(1) + ", " + thePlayer.position.y.toFixed(1) + ", " + thePlayer.position.z.toFixed(1)
    }
    return "No data"
}

const UiGame_InfoPopup = () => (
    <UiEntity
        uiTransform={{
            width: '100%', 
            height: '100%',
            justifyContent: 'center'
            }}
        >
        <UiEntity
            uiTransform={{
                width: '700px', 
                height: '120px',
                position: { bottom: '70px' },
                margin: { right: '60px'},
            }}
            uiBackground={{
                textureMode: 'stretch',
                texture: { src: 'assets/ui/background_popup.png'}
            }}
            uiText={{
                //value: "Hi there, welcome! Walk to the coffe machine and make a coffee!",
                value: getPlayerPos(),
                fontSize: 20,
            }}
        />
    </UiEntity>
)

const UiGame = () => (
    <UiEntity
        uiTransform={{
            width: '100%', 
            height: UiGameHeight, 
            //margin: {top: '50px', left: '50px'},
            //flexDirection: 'column',
            overflow: 'hidden'
        }}
        //uiBackground={{color: Color4.fromInts(0, 255, 0, 80) }}
    >
        <UiGame_LeftBar />

        {/*Middle*/}
        <UiEntity
            uiTransform={{
                width: '100%', 
                height: '100%', 
                //margin: {top: '0px', right: '50px'},
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'center',
            }}
        >
            <UiGame_TopBar />

            <UiGame_InfoPopup />

            {/*Bottom bar*/}
            <UiEntity
                uiTransform={{
                    width: '100%', 
                    height: '100px', 
                    //margin: {top: '0px', right: '50px'},
                }}
                //uiBackground={{color: Color4.fromInts(255, 0, 0, 80) }}
            >
                
            </UiEntity>
        </UiEntity>

        <UiGame_RightBar />
        
    </UiEntity>
)

let cafeUiVisible = false
export function cafeUiVisible_set(val: boolean) {
    cafeUiVisible = val
}
export const uiMain = () => (
    <UiEntity
        uiTransform={{
            width: '100%', 
            height: '100%', 
            //margin: {top: '50px', left: '50px'},
            flexDirection: 'column',
            display: cafeUiVisible ? 'flex' : 'none'
        }}
        //uiBackground={{color: Color4.Red() }}
    >
        <UiHome />
        <UiLobbyList />
        <UiGame />
    </UiEntity>
)

// PROJECT NOT FINISHED
// PLACE AN EXPLANATION
export const uiProjectNotFinished = () => (
    <UiEntity
        uiTransform={{
            width: '100%', 
            height: '100px', 
            margin: {top: '50px' },
            flexDirection: 'column',
        }}
        uiBackground={{color: Color4.fromInts(0, 0, 0, 150) }}
        uiText={{
            value: "This project is not finished on time. \n Code and UI are removed to avoid confusion \nThere are only 3D models now... I hope to complete sometime. Thanks for visiting!",
            fontSize: 20
        }}
    />
)