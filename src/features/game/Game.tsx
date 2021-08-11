import React from "react";
import { useSelector } from "react-redux"
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import { Unit } from "../unit/Unit";
import styles from './Game.module.css';
import { cancel } from "./gameSlice";
import { GridCell } from "./GridCell";

const unitIsAt = (units: Unit[], i: number) => {
    for (const unit of units) {
        for (const position of unit.positions) {
            if (position.y + position.x * 5 === i) {
                return true;
            }
        }
    }
    return false;
}

const unitHeadIsAt = (units: Unit[], i: number) => {
    for (const unit of units) {
        const head = unit.positions[unit.positions.length - 1];
        if (head.y + head.x * 5 === i) {
            return true;
        }
    }
    return false;
}

const positionOfGrid = (i: number) => {
    const x = Math.floor(i / 5);
    const y = i % 5;
    return { x, y };
}

const grid = (gridSize: { height: number, width: number }, units: Unit[]) =>
    [...Array(gridSize.height * gridSize.width).keys()]
        .map(i =>
            <GridCell key={i} isHead={unitHeadIsAt(units, i)} isActive={unitIsAt(units, i)} position={positionOfGrid(i)} />
        );

export function Game() {
    const dispatch = useAppDispatch();
    const { units, gridSize, phase } = useSelector((state: RootState) => state.game);
    return (
        <React.Fragment>
            <p>{phase}</p>
            <div className={styles.wrapper}>
                {grid(gridSize, units)}
            </div>
            <button onClick={() => dispatch(cancel())}>cancel</button>
        </React.Fragment>
    );
}
