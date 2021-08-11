import React from "react";
import { useSelector } from "react-redux"
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import Unit from "../unit/Unit";
import styles from './Game.module.css';
import { endTurn, reset, getUnitList, getSelectedUnit } from "./gameSlice";
import { GridCell } from "./GridCell";
import { Position, posEquals } from "./Position";
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

const grid = (gridSize: { height: number, width: number }, units: Unit[], selectedUnit: Unit | undefined) =>{
    //TODO: This is doing this each render call? hmmmm
    const movableCells = selectedUnit===undefined ? [] : bfs(selectedUnit,units,gridSize);
    return [...Array(gridSize.height * gridSize.width).keys()]
        .map(i =>{
          const cellPos=positionOfGrid(i, gridSize);
          const isCellSelected = isSelected(positionOfGrid(i, gridSize), selectedUnit);
          const isMovableCell = movableCells===undefined ? false : movableCells.some(pos => posEquals(pos,cellPos));
          let glowColor = undefined;
          //TODO: Refactor to some constants file
          if (isCellSelected){
            glowColor="#384bfa";
          }else if (isMovableCell){
            glowColor="#00ff00";
          }
          return  <GridCell
                key={i}
                color={getColor(cellPos, units)}
                glowColor={glowColor}
                position={cellPos} />
        });
};

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
