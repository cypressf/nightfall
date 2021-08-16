import React from "react";
import { useSelector } from "react-redux"
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import Unit from "../unit/Unit";
import styles from './Game.module.css';
import { endTurn, reset, getUnitList, getSelectedUnit, positionOfGrid } from "./gameSlice";
import { GridCell } from "./GridCell";
import { Position, posHash } from "./Position";

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

const grid = (gridSize: { height: number, width: number }, units: Unit[], selectedUnit: Unit | undefined, gridGlows: { [key: string]: string | undefined }) => {
    return [...Array(gridSize.height * gridSize.width).keys()]
        .map(i => {
            const cellPos = positionOfGrid(i, gridSize);
            let glowColor = gridGlows[posHash(cellPos)];
            return <GridCell
                key={i}
                color={getColor(cellPos, units)}
                glowColor={glowColor}
                position={cellPos} />
        });
};

export function Game() {
    const dispatch = useAppDispatch();
    const { gridSize, phase, selectedUnit, turn, units, gridGlows } =
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
                {grid(gridSize, units, selectedUnit, gridGlows)}
            </div>
            <button onClick={() => dispatch(reset())}>reset</button>
        </React.Fragment>
    );
}
