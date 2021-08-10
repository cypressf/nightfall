import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import {Unit} from "../unit/Unit";
import {Position} from "./Position";

export interface GameState {
    unit: Unit;
    gridSize: { width: number, height: number };
};

const initialState: GameState = {
    unit: {
      position: { x: 0, y: 0 },
      length:1,
      stats:{
        name:"Test",
        maxLength:1,
        range:1,
        movement:1,
        attack:1,
      }
    },
    gridSize: { width: 5, height: 5 },
};

const locationValid = (oldPosition: Position, newPosition: Position) =>
    Math.abs(newPosition.x - oldPosition.x) <= 1 &&
    Math.abs(newPosition.y - oldPosition.y) <= 1;

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        moveUnit: (state: GameState, action: PayloadAction<Position>) => {
            if (locationValid(state.unit.position, action.payload)) {
                state.unit.position = action.payload;
            }
        },
    },
});

export const { moveUnit } = gameSlice.actions;

export default gameSlice.reducer;
