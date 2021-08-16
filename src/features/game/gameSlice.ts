import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Unit from "../unit/Unit";
import { Position, posEquals, posHash } from "./Position";
import { bfs } from "../search/Brain";

export interface GameState {
    turn: number;
    units: { [key: string]: Unit };
    selectedUnit?: string;
    phase: "action";
    gridSize: { width: number, height: number };
    gridGlows: { [key: string]: string | undefined };
};

const defaultUnits: Unit[] = [{
    positions: [{ x: 0, y: 0 }],
    movesUsed: 0,
    attackUsed: false,
    stats: {
        name: "Red",
        maxLength: 5,
        range: 1,
        movement: 2,
        attack: 3,
        color: "red",
        headColor: "brown",
        id: "a",
    }
},
{
    positions: [{ x: 4, y: 4 }],
    movesUsed: 0,
    attackUsed: false,
    stats: {
        name: "Yellow",
        maxLength: 2,
        range: 3,
        movement: 1,
        attack: 1,
        color: "yellow",
        headColor: "green",
        id: "b",
    }
},
{
    positions: [{ x: 9, y: 9 }],
    movesUsed: 0,
    attackUsed: false,
    stats: {
        name: "Purple",
        maxLength: 1,
        range: 1,
        movement: 5,
        attack: 2,
        color: "purple",
        headColor: "pink",
        id: "p",
    }
}];

export const positionOfGrid = (i: number, gridSize: { height: number, width: number }) => {
    const x = Math.floor(i / gridSize.width);
    const y = i % gridSize.height;
    return { x, y };
}

export const isSelected = (position: Position, selectedUnit: Unit | undefined) => {
    if (!selectedUnit) {
        return false;
    }
    return selectedUnit.positions.some(
        unitPosition => unitPosition.x === position.x && unitPosition.y === position.y
    );
}

/**
  Given a lot of stuff, calculate the proper glow color for -every- cell.
  I believe this is required since if you just change the new call glows,
  react won't update the ones which aren't suppopsed to be glowing any more.
  Returns a map of {PosHashStr:glowColorStr}
*/
export const generateFullGridGlows = (gridSize: { width: number, height: number }, bfsPos: Position[], units: Unit[], selectedUnit: Unit | undefined) => {
    const toReturn: { [key: string]: string | undefined } = {};
    [...Array(gridSize.height * gridSize.width).keys()]
        .forEach(i => {
            const cellPos = positionOfGrid(i, gridSize);
            const isMovableCell = bfsPos.some(pos => posEquals(pos, cellPos));
            const isCellSelected = isSelected(cellPos, selectedUnit);
            let glowColor = undefined;
            //TODO: Refactor to some constants file
            if (isCellSelected) {
                glowColor = "#384bfa";
            } else if (isMovableCell) {
                glowColor = "#00ff00";
            }
            toReturn[posHash(cellPos)] = glowColor
        });
    return toReturn;
}

const initialGridSize = { width: 10, height: 10 };
const initialUnits = defaultUnits.reduce((map: { [key: string]: Unit }, unit) => {
    map[unit.stats.id] = unit;
    return map;
}, {});
const initialState: GameState = {
    turn: 0,
    phase: "action",
    gridSize: initialGridSize,
    units: initialUnits,
    gridGlows: generateFullGridGlows(initialGridSize, [], defaultUnits, undefined),
};

export const overlapsAnything = (units: Unit[], newPosition: Position) => {
    for (const unit of units) {
        if (overlaps(unit.positions, newPosition)) {
            return true;
        }
    }
    return false;
}

const overlaps = (positions: Position[], position: Position) => {
    for (const existingPosition of positions) {
        if (existingPosition.x === position.x && existingPosition.y === position.y) {
            return true;
        }
    }
    return false;
}

const locationValid = (units: Unit[], unit: Unit, newPosition: Position) => {
    const oldPositions = unit.positions;
    const oldHead = oldPositions[oldPositions.length - 1];
    return Math.abs(newPosition.x - oldHead.x) +
        Math.abs(newPosition.y - oldHead.y) <= 1 &&
        !overlapsAnything(units, newPosition);
}

export const unitAt = (position: Position, units: Unit[]) => {
    for (const unit of units) {
        if (overlaps(unit.positions, position)) {
            return unit;
        }
    }
}

const isInRange = (unit: Unit, target: Position) => {
    const head = unit.positions[unit.positions.length - 1];
    return Math.abs(head.x - target.x) + Math.abs(head.y - target.y) <= unit.stats.range;
}


export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        move: (state: GameState, action: PayloadAction<Position>) => {
            if (state.phase !== "action" || state.selectedUnit === undefined) {
                return;
            }
            const unit = state.units[state.selectedUnit];
            if (unit.movesUsed >= unit.stats.movement) {
                return;
            }
            if (locationValid(getUnitList(state), unit, action.payload)) {
                unit.positions.push(action.payload);
                unit.movesUsed++;
            }
            if (unit.positions.length > unit.stats.maxLength) {
                unit.positions.shift();
            }
            const bfsPos = bfs(unit, getUnitList(state), state.gridSize);
            state.gridGlows = generateFullGridGlows(state.gridSize, bfsPos, getUnitList(state), unit);
        },
        select: (state: GameState, action: PayloadAction<Position>) => {
            const unit = unitAt(action.payload, getUnitList(state));
            if (unit) {
                state.phase = "action";
                state.selectedUnit = unit.stats.id;

                const bfsPos = bfs(unit, getUnitList(state), state.gridSize);
                state.gridGlows = generateFullGridGlows(state.gridSize, bfsPos, getUnitList(state), unit);
            }
        },
        reset: () => {
            return initialState;
        },
        attack: (state: GameState, action: PayloadAction<Position>) => {
            const targetPosition = action.payload;
            const target = unitAt(targetPosition, getUnitList(state));
            if (state.phase !== "action" || state.selectedUnit === undefined || !target) {
                return;
            }
            const unit = state.units[state.selectedUnit];
            if (unit === target || unit.attackUsed || !isInRange(unit, targetPosition)) {
                return;
            }
            unit.attackUsed = true;
            if (unit.stats.attack >= target.positions.length) {
                delete state.units[target.stats.id];
            }
            target.positions.splice(0, unit.stats.attack);
        },
        endTurn: (state: GameState) => {
            state.turn++;
            for (const unit of getUnitList(state)) {
                unit.movesUsed = 0;
                unit.attackUsed = false;
            };
        },
    },
});

export const { move, select, attack, reset, endTurn } = gameSlice.actions;

export const getSelectedUnit = (state: GameState) =>
    state.selectedUnit ? state.units[state.selectedUnit] : undefined;

export const getUnitList = (state: GameState) => Object.values(state.units);

export default gameSlice.reducer;
