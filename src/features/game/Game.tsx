import React from "react";
import { useSelector } from "react-redux"
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import styles from './Game.module.css';
import { endTurn, reset, getSelectedUnit, getGridGlows, getGridColors, getActivePlayer, Phase } from "./gameSlice";
import { Grid, gridDimensions, positionOfGrid } from "./Grid";
import { GridCell } from "./GridCell";
import { posHash } from "./Position";
import UnitInfo from "./UnitInfo";

const genGrid = (
    grid: Grid,
    gridGlows: { [key: string]: string | undefined },
    gridColors: { [key: string]: string | undefined },
    phase: Phase,
) => [...Array(gridDimensions(grid).height * gridDimensions(grid).width).keys()]
    .map(i => {
        const cellPos = positionOfGrid(i, grid);
        const glowColor = gridGlows[posHash(cellPos)];
        const color = gridColors[posHash(cellPos)];
        return <GridCell
            key={i}
            color={color}
            glowColor={glowColor}
            position={cellPos}
            phase={phase} />
    });

export function Game() {
    const dispatch = useAppDispatch();
    const { grid, phase, selectedUnit, turn, gridGlows, gridColors, activePlayer } =
        useSelector((state: RootState) => ({
            ...state.game,
            selectedUnit: getSelectedUnit(state.game),
            gridGlows: getGridGlows(state.game),
            gridColors: getGridColors(state.game),
            activePlayer: getActivePlayer(state.game),
        }));
    return (
        <React.Fragment>
            {
                phase === "game over" &&
                <p>Game over. Player {activePlayer.name} wins!</p>
            }
            <h1>{activePlayer.name}'s turn</h1>
            {
                phase !== "game over" &&
                <button
                    onClick={() => dispatch(endTurn())}
                    id={styles.endTurn}>End Turn</button>
            }
            <p>{phase}{selectedUnit !== undefined ? ": " + selectedUnit.stats.name : ""}</p>

            <div id={styles.mapAndInfo}>
                <div className={styles.wrapper}>
                    {genGrid(grid, gridGlows, gridColors, phase)}
                </div>
                {selectedUnit && <UnitInfo unit={selectedUnit} />}
            </div>
            <button onClick={() => dispatch(reset())}>reset</button>
        </React.Fragment>
    );
}
