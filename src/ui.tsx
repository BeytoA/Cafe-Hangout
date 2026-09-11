import {
  engine,
  Transform,
} from '@dcl/sdk/ecs'
import { Color4 } from '@dcl/sdk/math'
import ReactEcs, { Button, Input, Label, ReactEcsRenderer, UiEntity } from '@dcl/sdk/react-ecs'

export function setupUi() {
  ReactEcsRenderer.setUiRenderer(uiComponent)
}

let inputText = ''
let clearInput = false

const uiComponent = () => {
  const inputValue = clearInput ? ' ' : ''
  if (clearInput) clearInput = false

  return (
    <UiEntity
      uiTransform={{
        width: 400,
        height: 230,
        margin: '16px 0 8px 270px',
        padding: 4,
      }}
      uiBackground={{ color: Color4.create(0.5, 0.8, 0.1, 0.6) }}
    >
      <UiEntity
        uiTransform={{
          width: '100%',
          height: '100%',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
        uiBackground={{ color: Color4.fromHexString("#70ac76ff") }}
      >
        <UiEntity
          uiTransform={{
            width: '100%',
            height: 50,
            margin: '8px 0'
          }}
          uiBackground={{
            textureMode: 'center',
            texture: {
              src: 'images/scene-thumbnail.png',
            },
          }}
          uiText={{ value: 'SDK7', fontSize: 18 }}
        />
        <Label
          onMouseDown={() => {console.log('Player Position clicked !')}}
          value={`Player: ${getPlayerPosition()}`}
          fontSize={18}
          uiTransform={{ width: '100%', height: 30 } }
        />
        <Label
          onMouseDown={() => {console.log('# Cubes clicked !')}}
          value={`Text input: `}
          fontSize={18}
          uiTransform={{ width: '100%', height: 30 } }
        />
        <Input
          onSubmit={() => {
            console.log('submitted value: ' + inputText)
            inputText = ''
            clearInput = true
          }}
          fontSize={18}
          placeholder={'type something'}
          placeholderColor={Color4.Black()}
          value={inputValue}
          onChange={(value) => { inputText = value }}
          uiTransform={{
            height: '80px',
            margin: '15px',
          }}
        />
        <Button
          value="Submit text"
          variant="primary"
          uiTransform={{ alignSelf: 'center', padding: '25px' }}
          onMouseDown={() => {
            console.log('submitted value: ' + inputText)
            inputText = ''
            clearInput = true
          }}
        />
      </UiEntity>
    </UiEntity>
  )
}
  

function getPlayerPosition() {
  const playerPosition = Transform.getOrNull(engine.PlayerEntity)
  if (!playerPosition) return ' no data yet'
  const { x, y, z } = playerPosition.position
  return `{X: ${x.toFixed(2)}, Y: ${y.toFixed(2)}, z: ${z.toFixed(2)} }`
}

