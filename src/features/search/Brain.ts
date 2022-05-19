import Unit from '../unit/Unit'
import { Position, posEquals, posHash, revHash } from '../game/Position'
import {
    GridInfo,
    isSelected,
    GameState,
    overlapsAnything,
    Phase,
    Player,
    select,
} from '../game/gameSlice'
import { Grid, inGrid } from '../game/Grid'

export const head = (unit: Unit) => {
    return unit.positions[unit.positions.length - 1]
}

/**
 * Given a attacker unit and a target position, can that unit attack that position?
 * @param attacker
 * @param target
 * @returns
 */
export const targetInRange = (attacker: Unit, target: Position) => {
    const attackerHead = head(attacker)
    return manDistance(attackerHead, target) <= attacker.stats.range
}

export const manDistance = (pos1: Position, pos2: Position) => {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
}

export const positionsWithinUnitRange = (attacker: Unit) => {
    return positionsWithinRange(head(attacker), attacker.stats.range)
}

/**
 * Filter a list of positions to only those that are in the grid. This includes holes.
 */
const inBounds = (positions: Position[], grid: Grid) => {
    return positions.filter((pos) => inGrid(grid, pos))
}

/**
 * Filter a list of positions to only those that do no overlap anything
 */
const empty = (positions: Position[], units: Unit[]) => {
    return positions.filter((pos) => !overlapsAnything(units, pos))
}

/**
 * Filter a list of positions to only those that are not in the seen position list
 */
const unseen = (positions: Position[], seenPos: Position[]) => {
    return positions.filter((pos) => {
        //TODO: Eww, replace with set and hash/equals implementation
        for (const otherPos of seenPos) {
            if (posEquals(pos, otherPos)) {
                return false
            }
        }
        return true
    })
}

const positionsWithinRange = (position: Position, distance: number) => {
    const toReturn = []
    for (let x = -distance; x <= distance; x++) {
        for (let y = -distance + Math.abs(x); y <= distance - Math.abs(x); y++) {
            toReturn.push({
                x: position.x + x,
                y: position.y + y,
            })
        }
    }
    return toReturn
}

const adjacent = (position: Position) => positionsWithinRange(position, 1)

export const aiSubTurn = (
    aiUnits: Unit[],
    enemyUnits: Unit[],
    units: Unit[],
    grid: Grid,
    state: GameState,
    moveAction: any,
    selectAction: any,
    attackAction: any,
    endTurnAction: any
) => {
    //TODO: This is a pretty crap allocation strategy, do some thinking about a better one.
    //orrrr, make it more deterministic as to how the ai will attack, like a puzzle.

    //So for now, it just goes through the enemies and tries to assign one of its units to attack it.
    //The 'best' choice is the one which is closest, for now. If no ai units can reach the enemy it doesn't move them.
    //This is wrong in so many ways.
    const usedAiUnitIds: string[] = []
    for (const enemyUnit of enemyUnits) {
        let aiUnitToUse = null
        let pathLengthToUse = Infinity
        let targetPosToUse = null
        let pathToUse = null
        for (const aiUnit of aiUnits) {
            if (aiUnit.attackUsed || usedAiUnitIds.includes(aiUnit.stats.id)) {
                //We only want units who can fire. Movement checking is handled by the bfs
                continue
            }
            const { minPath, bestTargetPos } = unitFirePathBfs(aiUnit, enemyUnit, units, grid)
            if (minPath != null && bestTargetPos != null && minPath.length < pathLengthToUse) {
                aiUnitToUse = aiUnit
                pathLengthToUse = minPath.length
                targetPosToUse = bestTargetPos
                pathToUse = minPath
                usedAiUnitIds.push(aiUnit.stats.id)
            }
        }

        if (aiUnitToUse != null) {
            //I'd really like to package the choices here into an object to compare them against each other.
            //However, that would necessitate making a kind of hypothetical game state, since one ai move affects another
            // (you can't move where the tail of another unit is going to move)
            //I think deep copying the game state, or keeping marginal bookkeeping might be how to do this, but its too much to bite off for now.
            //If we ever want a more sophesticated algo, here is where things will get interesting.

            //Instead, just do the best thing right now!

            //Step 1: select unit
            selectAction(state, { payload: aiUnitToUse.positions[0] })

            //Step 2: Possibly move unit
            if (pathToUse != null) {
                state.phase = 'move'
                for (const pos of pathToUse) {
                    moveAction(state, { payload: pos })
                }
            }

            //Step 3: Possibly attack
            if (targetPosToUse != null) {
                state.phase = 'attack'
                attackAction(state, { payload: targetPosToUse })
            }
        }
    }
    //Step 4: Profit
    endTurnAction(state)
}

// const activePlayerUnits = useSelector(selectActivePlayerUnits);

//Generally find a path between a start and target position, without any max length.
export const pathBfs = (start: Position, target: Position, units: Unit[], grid: Grid) => {
    return bfsHelper(start, Infinity, units, grid, target)
}

//Given a particular unit, path with it to a target, or get available movement squares if target is null
export const unitBfs = (mover: Unit, units: Unit[], grid: Grid, target?: Position) => {
    return bfsHelper(head(mover), mover.stats.movement - mover.movesUsed, units, grid, target)
}

//Given an attacking unit and a defending unit, how does the attacker path to within firing range of the defender?
export const unitFirePathBfs = (attacker: Unit, defender: Unit, units: Unit[], grid: Grid) => {
    let minPath = null
    let bestTargetPos = null
    for (const targetPos of defender.positions) {
        const { path, reachTarget } = bfsHelper(
            head(attacker),
            attacker.stats.movement - attacker.movesUsed,
            units,
            grid,
            targetPos,
            attacker.stats.range
        )
        if (
            reachTarget &&
            path !== undefined &&
            (minPath == null || path.length < minPath.length)
        ) {
            minPath = path
            bestTargetPos = targetPos
        }
    }
    return { minPath, bestTargetPos }
}

/**
 * This has two types of operation.
 * If the target not null, the bfs just explores all valid positions within range and returns them in seenPos.
 * If target is null, the bfs will try to explore to that position and output the path needed to get there, and if it was sucessful.
 * In target-defined mode, the seenPos will be less useful.
 */
export const bfsHelper = (
    start: Position,
    maxPathLength: number,
    units: Unit[],
    grid: Grid,
    target?: Position,
    targetDistance: number = 0
) => {
    const emptyPath: Position[] = []
    const initialNode = {
        position: start,
        movement: maxPathLength,
        path: emptyPath,
    }
    const queue = [initialNode]
    const seenPos: Position[] = []

    let curNode = initialNode
    while (queue.length !== 0) {
        const nodeOrUndef = queue.shift()
        if (nodeOrUndef === undefined) {
            //Because of the length!=0 check, the shift should always have one element.
            //This *should* be impossible to reach.
            //But lets please the tyrannical typescript gods
            return { seenPos: [], path: [], reachTarget: false }
        } else {
            curNode = nodeOrUndef
        }

        if (!posEquals(curNode.position, start)) {
            seenPos.push(curNode.position)
        }

        if (target != null && manDistance(target, curNode.position) <= targetDistance) {
            return { seenPos, path: curNode.path, reachTarget: true }
        }

        if (curNode.movement === 0) {
            continue //Stop right there, yall aint got none movement
        }

        const nearPlaces = adjacent(curNode.position)
        const inPlaces = inBounds(nearPlaces, grid)
        const emptyPlaces = empty(inPlaces, units)
        const unseenPlaces = unseen(emptyPlaces, seenPos)

        for (const validPlace of unseenPlaces) {
            const newPath = curNode.path.concat([validPlace])
            const newNode = {
                position: validPlace,
                movement: curNode.movement - 1,
                path: newPath,
            }
            queue.push(newNode)
        }
    }
    return { seenPos, path: curNode.path, reachTarget: false }
}

export const generateGridInfo = (
    selectedUnit: Unit | undefined,
    phase: Phase,
    units: Unit[],
    grid: Grid,
    activePlayer: Player
) => {
    const gridInfo: { [key: string]: GridInfo } = {}
    Object.entries(grid).forEach(([key, exists]) => {
        if (exists) gridInfo[key] = { position: revHash(key) }
    })

    units.forEach((unit) => {
        const isActivePlayerUnit = activePlayer.unitIds.includes(unit.stats.id)
        unit.positions.forEach((position, i) => {
            gridInfo[posHash(position)] = {
                position,
                unit: unit,
                unitType: isActivePlayerUnit ? 'ally' : 'enemy',
                unitSelected: isSelected(position, selectedUnit),
                unitHead: posEquals(head(unit), position),
                unitLink: undefined, // TODO
                showImmediateMove: undefined, // TODO
            }
        })
        if (selectedUnit && phase === 'move') {
            const { seenPos } = unitBfs(selectedUnit, units, grid)
            seenPos.forEach((position) => {
                gridInfo[posHash(position)] = {
                    position,
                    showMoveHighlight: true,
                }
            })
            const unitHead = head(selectedUnit)
            const { seenPos: immediateMoves } = bfsHelper(
                unitHead,
                Math.min(selectedUnit.stats.movement - selectedUnit.movesUsed, 1),
                units,
                grid
            )
            immediateMoves.forEach((position) => {
                if (position.x > unitHead.x) {
                    gridInfo[posHash(position)].showImmediateMove = 'right'
                } else if (position.x < unitHead.x) {
                    gridInfo[posHash(position)].showImmediateMove = 'left'
                } else if (position.y > unitHead.y) {
                    gridInfo[posHash(position)].showImmediateMove = 'down'
                } else if (position.y < unitHead.y) {
                    gridInfo[posHash(position)].showImmediateMove = 'up'
                }
            })
        }
        if (selectedUnit && phase === 'attack' && !selectedUnit.attackUsed) {
            const attackPositions = positionsWithinUnitRange(selectedUnit)
            attackPositions.forEach((position) => {
                const existingGridInfo = gridInfo[posHash(position)]
                if (existingGridInfo) {
                    existingGridInfo.showAttackHighlight = true
                } else {
                    gridInfo[posHash(position)] = {
                        position,
                        showAttackHighlight: true,
                    }
                }
            })
        }
    })

    return gridInfo
}
