import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface Position {
    x: number;
    y: number;
}

export interface Unit {
    position: Position;
};

export interface GameState {
    unit: Unit;
};

const initialState: GameState = {
    unit: { position: { x: 0, y: 0 } },
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        moveUnit: (state: GameState, action: PayloadAction<Position>) => {
            state.unit.position = action.payload;
        },
    },
});

export const { moveUnit } = gameSlice.actions;

export default gameSlice.reducer;