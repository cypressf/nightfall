import React from "react";
import { useSelector } from "react-redux"
import { RootState } from "../../app/store";
import { Unit } from "./gameSlice";
import styles from './Game.module.css';
import { GridCell } from "./GridCell";

const unitIsAt = (unit: Unit, i: number) => {
    for (const position of unit.positions) {
        if (position.y + position.x * 5 === i) {
            return true;
        }
    }
    return false;
}

const unitHeadIsAt = (unit: Unit, i: number) => {
    const head = unit.positions[unit.positions.length - 1];
    return head.y + head.x * 5 === i;
}

const positionOfGrid = (i: number) => {
    const x = Math.floor(i / 5);
    const y = i % 5;
    return { x, y };
}

const grid = (gridSize: { height: number, width: number }, unit: Unit) =>
    [...Array(gridSize.height * gridSize.width).keys()]
        .map(i =>
            <GridCell isHead={unitHeadIsAt(unit, i)} isActive={unitIsAt(unit, i)} position={positionOfGrid(i)} />
        );

export function Game() {
    const { unit, gridSize } = useSelector((state: RootState) => state.game);
    return (
        <React.Fragment>
            <div className={styles.wrapper}>
                {grid(gridSize, unit)}
            </div>
        </React.Fragment>
    );
}