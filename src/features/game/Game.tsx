import React from "react";
import { useSelector } from "react-redux"
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import Unit from "../unit/Unit";
import styles from './Game.module.css';
import { cancel } from "./gameSlice";
import { GridCell } from "./GridCell";
import { Position } from "./Position";

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

const grid = (gridSize: { height: number, width: number }, units: Unit[]) =>
    [...Array(gridSize.height * gridSize.width).keys()]
        .map(i =>
            <GridCell
                key={i}
                color={getColor(positionOfGrid(i, gridSize), units)}
                position={positionOfGrid(i, gridSize)} />
        );

export function Game() {
    const dispatch = useAppDispatch();
    const { units, gridSize, phase, selectedUnit } = useSelector((state: RootState) => state.game);
    return (
        <React.Fragment>
            <p>{phase}{selectedUnit !== undefined ? ": " + units[selectedUnit].stats.name : ""}</p>
            <div className={styles.wrapper}>
                {grid(gridSize, units)}
            </div>
            <button onClick={() => dispatch(cancel())}>cancel</button>
        </React.Fragment>
    );
}
