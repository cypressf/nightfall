import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import Unit from "../unit/Unit";
import { Position } from "./Position";

export interface GameState {
    units: Unit[];
    selectedUnit?: number;
    phase: "select" | "action";
    gridSize: { width: number, height: number };
};

const initialState: GameState = {
    phase: "select",
    gridSize: { width: 10, height: 10 },
    units: [{
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
        }
    }],
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
    for (const unit of state.units) {
        if (overlaps(unit.positions, position)) {
            return unit;
        }
    }
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
            if (locationValid(state.units, unit, action.payload)) {
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
                const unitIndex = state.units.indexOf(unit);
                state.selectedUnit = unitIndex;
            }
        },
        cancel: (state: GameState) => {
            state.selectedUnit = undefined;
            state.phase = "select";
        },
    },
});

export const { moveUnit, selectUnit, cancel } = gameSlice.actions;

export default gameSlice.reducer;
