import React from "react";
import { useSelector } from "react-redux"
import { RootState } from "../../app/store";
import { Unit } from "../unit/Unit";
import styles from './Game.module.css';
import { GridCell } from "./GridCell";

const unitIsAt = (unit: Unit, i: number) => {
    const sum = unit.position.y + unit.position.x * 5;
    return sum === i;
}

const positionOfGrid = (i: number) => {
    const x = Math.floor(i / 5);
    const y = i % 5;
    return { x, y };
}

const grid = (gridSize: { height: number, width: number }, unit: Unit) =>
    [...Array(gridSize.height * gridSize.width).keys()]
        .map(i =>
            <GridCell active={unitIsAt(unit, i)} position={positionOfGrid(i)} />
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
