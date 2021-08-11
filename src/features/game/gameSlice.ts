import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Unit from "../unit/Unit";
import { Position } from "./Position";

export interface GameState {
    units: { [key: string]: Unit };
    selectedUnit?: string;
    phase: "select" | "action";
    gridSize: { width: number, height: number };
};

const defaultUnits = [{
    positions: [{ x: 0, y: 0 }],
    length: 1,
    stats: {
        name: "Red",
        maxLength: 3,
        range: 1,
        movement: 1,
        attack: 1,
        color: "red",
        headColor: "brown",
        id: "a",
    }
},
{
    positions: [{ x: 4, y: 4 }],
    length: 1,
    stats: {
        name: "Yellow",
        maxLength: 3,
        range: 1,
        movement: 1,
        attack: 1,
        color: "yellow",
        headColor: "green",
        id: "b",
    }
}];

const initialState: GameState = {
    phase: "select",
    gridSize: { width: 10, height: 10 },
    units: defaultUnits.reduce((map: { [key: string]: Unit }, unit) => {
        map[unit.stats.id] = unit;
        return map;
    }, {}),
};

const overlapsAnything = (units: Unit[], newPosition: Position) => {
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

const unitAt = (position: Position, state: GameState) => {
    for (const unit of Object.values(state.units)) {
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
        moveUnit: (state: GameState, action: PayloadAction<Position>) => {
            if (state.phase !== "action" || state.selectedUnit === undefined) {
                return;
            }
            const unit = state.units[state.selectedUnit];
            if (locationValid(Object.values(state.units), unit, action.payload)) {
                unit.positions.push(action.payload);
            }
            if (unit.positions.length > unit.stats.maxLength) {
                unit.positions.shift();
            }
        },
        selectUnit: (state: GameState, action: PayloadAction<Position>) => {
            if (state.phase !== "select") {
                return;
            }
            const unit = unitAt(action.payload, state);
            if (unit) {
                state.phase = "action";
                state.selectedUnit = unit.stats.id;
            }
        },
        cancel: (state: GameState) => {
            state.selectedUnit = undefined;
            state.phase = "select";
        },
        attack: (state: GameState, action: PayloadAction<Position>) => {
            const targetPosition = action.payload;
            const target = unitAt(targetPosition, state);
            if (state.phase !== "action" || state.selectedUnit === undefined || !target) {
                return;
            }
            const unit = state.units[state.selectedUnit];
            if (unit === target) {
                return; // stop hitting yourself!
            }
            if (!isInRange(unit, targetPosition)) {
                return;
            }
            if (unit.stats.attack >= target.positions.length) {
                delete state.units[target.stats.id];
            }
            target.positions.splice(0, unit.stats.attack);
        }
    },
});

export const { moveUnit, selectUnit, cancel, attack } = gameSlice.actions;

export default gameSlice.reducer;
