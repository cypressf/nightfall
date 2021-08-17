import React from "react";
import { useSelector } from "react-redux"
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import styles from './Game.module.css';
import { endTurn, reset, getSelectedUnit, positionOfGrid, getGridGlows, getGridColors, getActivePlayer } from "./gameSlice";
import { GridCell } from "./GridCell";
import { posHash } from "./Position";

const grid = (
    gridSize: { height: number, width: number },
    gridGlows: { [key: string]: string | undefined },
    gridColors: { [key: string]: string | undefined },
) => [...Array(gridSize.height * gridSize.width).keys()]
    .map(i => {
        const cellPos = positionOfGrid(i, gridSize);
        const glowColor = gridGlows[posHash(cellPos)];
        const color = gridColors[posHash(cellPos)];
        return <GridCell
            key={i}
            color={color}
            glowColor={glowColor}
            position={cellPos} />
    });

export function Game() {
    const dispatch = useAppDispatch();
    const { gridSize, phase, selectedUnit, turn, gridGlows, gridColors, activePlayer } =
        useSelector((state: RootState) => ({
            ...state.game,
            selectedUnit: getSelectedUnit(state.game),
            gridGlows: getGridGlows(state.game),
            gridColors: getGridColors(state.game),
            activePlayer: getActivePlayer(state.game),
        }));
    return (
        <React.Fragment>
            <p>Turn {turn + 1}: {activePlayer.name}</p> <button onClick={() => dispatch(endTurn())}>End Turn</button>
            <p>{phase}{selectedUnit !== undefined ? ": " + selectedUnit.stats.name : ""}</p>
            <div className={styles.wrapper}>
                {grid(gridSize, gridGlows, gridColors)}
            </div>
            <button onClick={() => dispatch(reset())}>reset</button>
        </React.Fragment>
    );
}
