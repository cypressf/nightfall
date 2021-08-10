import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {Unit} from "../unit/Unit";
import {Position} from "./Position";

export interface GameState {
    unit: Unit;
    gridSize: { width: number, height: number };
};

const initialState: GameState = {
    unit: {
      positions: [{ x: 0, y: 0 }],
      length:1,
      stats:{
        name:"Test",
        maxLength:3,
        range:1,
        movement:1,
        attack:1,
      }
    },
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


export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        moveUnit: (state: GameState, action: PayloadAction<Position>) => {
            if (locationValid(state.unit, action.payload)) {
                state.unit.positions.push(action.payload);
            }
            if (state.unit.positions.length > state.unit.stats.maxLength) {
                state.unit.positions.shift();
            }
        },
    },
});

export const { moveUnit } = gameSlice.actions;

export default gameSlice.reducer;
