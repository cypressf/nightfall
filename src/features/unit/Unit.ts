import { type Position } from '../game/Position'

export default interface Unit {
    readonly stats: {
        readonly maxLength: number
        readonly range: number
        readonly movement: number
        readonly attack: number
        readonly name: string
        readonly color: string
        readonly headColor: string
        readonly id: string
        readonly icon: string
    }
    positions: Position[]
    movesUsed: number
    attackUsed: boolean
}
