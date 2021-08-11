import React from "react";
import { useSelector } from "react-redux"
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import Unit from "../unit/Unit";
import styles from './Game.module.css';
import { endTurn, reset, getUnitList, getSelectedUnit } from "./gameSlice";
import { GridCell } from "./GridCell";
import { Position } from "./Position";
import { bfs } from "../search/Brain";

const getColor = (position: Position, units: Unit[]) => {
    for (const unit of units) {
        for (let i = 0; i < unit.positions.length; i++) {
            const unitPosition = unit.positions[i];
            if (unitPosition.x === position.x && unitPosition.y === position.y) {
                return i === unit.positions.length - 1 ? unit.stats.headColor : unit.stats.color;
            }
        }
    }
}

const positionOfGrid = (i: number, gridSize: { height: number, width: number }) => {
    const x = Math.floor(i / gridSize.width);
    const y = i % gridSize.height;
    return { x, y };
}

const isSelected = (position: Position, selectedUnit: Unit | undefined) => {
    if (!selectedUnit) {
        return false;
    }
    return selectedUnit.positions.some(
        unitPosition => unitPosition.x === position.x && unitPosition.y === position.y
    );
}

const grid = (gridSize: { height: number, width: number }, units: Unit[], selectedUnit: Unit | undefined) =>
    [...Array(gridSize.height * gridSize.width).keys()]
        .map(i =>
            <GridCell
                key={i}
                color={getColor(positionOfGrid(i, gridSize), units)}
                selected={isSelected(positionOfGrid(i, gridSize), selectedUnit)}
                position={positionOfGrid(i, gridSize)} />
        );

export function Game() {
    const dispatch = useAppDispatch();
    const { gridSize, phase, selectedUnit, turn, units } =
        useSelector((state: RootState) => ({
            ...state.game,
            units: getUnitList(state.game),
            selectedUnit: getSelectedUnit(state.game),
        }));
    return (
        <React.Fragment>
            <p>Turn {turn + 1}</p> <button onClick={() => dispatch(endTurn())}>End Turn</button>
            <p>{phase}{selectedUnit !== undefined ? ": " + selectedUnit.stats.name : ""}</p>
            <div className={styles.wrapper}>
                {grid(gridSize, units, selectedUnit)}
            </div>
            <button onClick={() => dispatch(reset())}>reset</button>
            <button onClick={() => selectedUnit!==undefined ? console.log(bfs(selectedUnit,units,gridSize)):console.log(null)}> BFS </button>
        </React.Fragment>
    );
}
