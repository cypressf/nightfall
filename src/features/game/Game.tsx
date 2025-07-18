import React from 'react'
import { useSelector } from 'react-redux'
import { useAppDispatch } from '../../app/hooks'
import { type RootState } from '../../app/store'
import styles from './Game.module.css'
import {
    endTurn,
    reset,
    selectSelectedUnit,
    selectActivePlayer,
    type Phase,
    clickAttack,
    clickMove,
    type GridInfo,
    selectGridInfo,
    aiTurn,
    selectActivePlayerUnits,
} from './gameSlice'
import { type Grid, gridDimensions, positionOfGrid } from './Grid'
import { GridCell } from './GridCell'
import { posHash } from './Position'
import UnitInfo from './UnitInfo'

const genGrid = (grid: Grid, allGridInfo: { [key: string]: GridInfo }, phase: Phase) =>
    [...Array(gridDimensions(grid).height * gridDimensions(grid).width).keys()].map((i) => {
        const cellPos = positionOfGrid(i, grid)
        const gridInfo = allGridInfo[posHash(cellPos)]
        return <GridCell key={i} gridInfo={gridInfo} phase={phase} />
    })

export function Game() {
    const dispatch = useAppDispatch()
    const grid = useSelector((state: RootState) => state.game.grid)
    const phase = useSelector((state: RootState) => state.game.phase)
    const selectedUnit = useSelector(selectSelectedUnit)
    const activePlayer = useSelector(selectActivePlayer)
    const gridInfo = useSelector(selectGridInfo)
    return (
        <React.Fragment>
            {phase === 'game over' && <h1>Game over, {activePlayer.name} wins!</h1>}
            {phase !== 'game over' && (
                <h1>
                    {activePlayer.name}:
                    {phase === 'move' && activePlayer.type === 'human' && (
                        <button onClick={() => dispatch(clickAttack())} className={styles.button}>
                            Attack
                        </button>
                    )}
                    {phase === 'attack' && activePlayer.type === 'human' && selectedUnit && (
                        <button
                            onClick={() => dispatch(clickMove())}
                            className={styles.button}
                            disabled={selectedUnit.movesUsed === selectedUnit.stats.movement}
                        >
                            Move
                        </button>
                    )}
                    {activePlayer.type === 'ai' && (
                        <button
                            onClick={() => dispatch(aiTurn(activePlayer))}
                            className={styles.button}
                        >
                            Ai Turn
                        </button>
                    )}
                    {activePlayer.type === 'human' && (
                        <button onClick={() => dispatch(endTurn())} className={styles.button}>
                            End Turn
                        </button>
                    )}
                </h1>
            )}

            <div id={styles.mapAndInfo}>
                <div className={styles.wrapper}>{genGrid(grid, gridInfo, phase)}</div>
                {selectedUnit && <UnitInfo unit={selectedUnit} />}
            </div>
            <button onClick={() => dispatch(reset())}>reset</button>
        </React.Fragment>
    )
}
