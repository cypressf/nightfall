import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Unit } from "../unit/Unit";
import { Position } from "./Position";

export interface GameState {
    units: Unit[];
    selectedUnit?: number;
    phase: "select" | "action";
    gridSize: { width: number, height: number };
};

const initialState: GameState = {
    phase: "select",
    units: [{
        positions: [{ x: 0, y: 0 }],
        length: 1,
        stats: {
            name: "Test",
            maxLength: 3,
            range: 1,
            movement: 1,
            attack: 1,
        }
    }],
    gridSize: { width: 5, height: 5 },
};

const overlapsAnything = (positions: Position[], newPosition: Position) => {
    for (const position of positions) {
        if (position.x === newPosition.x && position.y === newPosition.y) {
            return true;
        }
    }
    return false;
}

const locationValid = (unit: Unit, newPosition: Position) => {
    const oldPositions = unit.positions;
    const oldHead = oldPositions[oldPositions.length - 1];
    return Math.abs(newPosition.x - oldHead.x) <= 1 &&
        Math.abs(newPosition.y - oldHead.y) <= 1 &&
        !overlapsAnything(oldPositions, newPosition);
}

const unitAt = (position: Position, state: GameState) => {
    for (const unit of state.units) {
        if (overlapsAnything(unit.positions, position)) {
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
            if (locationValid(unit, action.payload)) {
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
