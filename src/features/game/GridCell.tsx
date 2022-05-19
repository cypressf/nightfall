import { attack, move, select, Phase, GridInfo } from './gameSlice'
import { useAppDispatch } from '../../app/hooks'
import * as d3 from 'd3-color'

const SELECTED_COLOR = '#384bfa'
const VALID_MOVE_POSITION_COLOR = 'rgb(201, 230, 253)'
const VALID_ATTACK_POSITION_COLOR = '#ff0000'
const DEFAULT_COLOR = 'rgb(240, 240, 240)'

type Props = {
    gridInfo: GridInfo | undefined
    phase: Phase
}

export const GridCell = ({ gridInfo, phase }: Props) => {
    const dispatch = useAppDispatch()

    if (!gridInfo) {
        return <div style={{ transition: 'background-color 0.2s' }}></div>
    }
    const {
        position,
        unit,
        unitType,
        unitSelected,
        unitHead,
        unitLink,
        showMoveHighlight,
        showAttackHighlight,
        showImmediateMove,
    } = gridInfo
    let color: string
    let glowColor: string | undefined = undefined
    if (unit) {
        const modifiableColor = unitHead
            ? d3.cubehelix(unit.stats.headColor)!
            : d3.cubehelix(unit.stats.color)!

        if (unitType === 'enemy') {
            if (unitHead) {
                modifiableColor.s *= 0.2
                modifiableColor.l *= 1.5
            } else {
                modifiableColor.s *= 0.2
            }
        }
        color = modifiableColor.toString()
        if (unitSelected) {
            glowColor = SELECTED_COLOR
        }
    } else if (showMoveHighlight) {
        color = VALID_MOVE_POSITION_COLOR
    } else {
        color = DEFAULT_COLOR
    }
    if (showAttackHighlight) {
        glowColor = VALID_ATTACK_POSITION_COLOR
    }
    let moveIcon = ''
    switch (showImmediateMove) {
        case 'left':
            moveIcon = '←'
            break
        case 'right':
            moveIcon = '→'
            break
        case 'up':
            moveIcon = '↑'
            break
        case 'down':
            moveIcon = '↓'
            break
        default:
            break
    }

    const handleClick = () => {
        if (unit && unitType === 'ally') {
            dispatch(select(position))
        } else {
            switch (phase) {
                case 'move':
                    if (!unit) {
                        dispatch(move(position))
                    }
                    break
                case 'attack':
                    dispatch(attack(position))
                    break
            }
        }
    }

    // A square is clickable if it is a valid attack square, a unit, or a valid movement space.
    // It should be a cursor if its your unit or a move square
    // it should be a cross hair if its a targetable enemy unit
    let cursorStyle = 'default'
    if (showImmediateMove) {
        cursorStyle = 'pointer'
    } else if (unit && unitType === 'ally') {
        cursorStyle = 'pointer'
    } else if (showAttackHighlight && unit && unitType === 'enemy') {
        cursorStyle = 'crosshair'
    }

    const style = {
        backgroundColor: color,
        boxShadow: glowColor ? '0px 0px 10px' + glowColor : undefined,
        transition: 'background-color 0.2s',
        cursor: cursorStyle,
    }
    return (
        <div style={style} onClick={handleClick}>
            {unitHead && unit && unit.stats.icon}
            {moveIcon}
        </div>
    )
}
