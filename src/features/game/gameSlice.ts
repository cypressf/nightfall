import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Unit from "../unit/Unit";
import { Position, posHash, revHash } from "./Position";
import { bfs, head, isInRange, withinAttackRange } from "../search/Brain";
import { Grid, gridDimensions, rectGridConstructor } from "./Grid";

const SELECTED_COLOR = "#384bfa";
const VALID_MOVE_POSITION_COLOR = "rgb(200, 206, 255)";
const VALID_ATTACK_POSITION_COLOR = "#ff0000";

export type Player = {
    name: string;
    unitIds: string[];
}

export interface GameState {
    turn: number;
    units: { [key: string]: Unit };
    selectedUnit?: string;
    phase: "action";
    grid: Grid;
    players: Player[];
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
        headColor: "rgb(228, 208, 34)",
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
        id: "c",
    }
}];

export const isSelected = (position: Position, selectedUnit: Unit | undefined) => {
    if (!selectedUnit) {
        return false;
    }
    return selectedUnit.positions.some(
        unitPosition => unitPosition.x === position.x && unitPosition.y === position.y
    );
}

/**
  Returns a map of {PosHashStr:glowColorStr}
*/
export const generateGridGlows = (selectedUnit: Unit | undefined) => {
    const gridGlows: { [key: string]: string } = {};
    if (!selectedUnit) {
        return gridGlows;
    }
    withinAttackRange(selectedUnit).forEach(position => {
        gridGlows[posHash(position)] = VALID_ATTACK_POSITION_COLOR;
    });
    selectedUnit.positions.forEach(position => {
        gridGlows[posHash(position)] = SELECTED_COLOR;
    });
    return gridGlows;
}

export const generateGridColors = (
    selectedUnit: Unit | undefined,
    units: Unit[],
    gridSize: { height: number, width: number },
) => {
    const gridColors: { [key: string]: string } = {};
    units.forEach(unit => {
        unit.positions.forEach(position => {
            gridColors[posHash(position)] = unit.stats.color;
        });
        gridColors[posHash(head(unit))] = unit.stats.headColor;
    });
    if (selectedUnit) {
        const validMovePositions = bfs(selectedUnit, units, gridSize);
        validMovePositions.forEach(position => {
            gridColors[posHash(position)] = VALID_MOVE_POSITION_COLOR;
        });
    }
    return gridColors;
}

const initialGrid = rectGridConstructor(10, 10);
const initialUnits = defaultUnits.reduce((map: { [key: string]: Unit }, unit) => {
    map[unit.stats.id] = unit;
    return map;
}, {});
const initialState: GameState = {
    turn: 0,
    phase: "action",
    grid: initialGrid,
    units: initialUnits,
    players: [
        {
            name: "Player 1",
            unitIds: ["a", "b"],
        },
        {
            name: "Player 2",
            unitIds: ["c"],
        },
    ],
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
            const units = getUnitList(state);
            if (locationValid(units, unit, action.payload)) {
                unit.positions.push(action.payload);
                unit.movesUsed++;
            }
            if (unit.positions.length > unit.stats.maxLength) {
                unit.positions.shift();
            }
        },
        select: (state: GameState, action: PayloadAction<Position>) => {
            const activeUnits = getActivePlayerUnits(state);
            const selectedUnit = unitAt(action.payload, activeUnits);
            if (selectedUnit) {
                state.phase = "action";
                state.selectedUnit = selectedUnit.stats.id;
            }
        },
        reset: () => {
            return initialState;
        },
        attack: (state: GameState, action: PayloadAction<Position>) => {
            const targetPosition = action.payload;
            const enemyUnits = getEnemyUnits(state);
            const target = unitAt(targetPosition, enemyUnits);
            if (state.phase !== "action" || state.selectedUnit === undefined || !target) {
                return;
            }
            const attacker = state.units[state.selectedUnit];
            if (attacker === target || attacker.attackUsed || !isInRange(attacker, targetPosition)) {
                return;
            }
            attacker.attackUsed = true;
            if (attacker.stats.attack >= target.positions.length) {
                delete state.units[target.stats.id];
            }
            target.positions.splice(0, attacker.stats.attack);
        },
        endTurn: (state: GameState) => {
            state.turn++;
            for (const unit of getUnitList(state)) {
                unit.movesUsed = 0;
                unit.attackUsed = false;
            };
            state.selectedUnit = getActivePlayerUnits(state)[0].stats.id;
        },
    },
});

export const { move, select, attack, reset, endTurn } = gameSlice.actions;

export const getSelectedUnit = (state: GameState) =>
    state.selectedUnit ? state.units[state.selectedUnit] : undefined;

export const getUnitList = (state: GameState) => Object.values(state.units);
export const getActivePlayer = (state: GameState) => state.players[state.turn % state.players.length];
export const getActivePlayerUnits = (state: GameState) =>
    getActivePlayer(state)
        .unitIds
        .map(unitId => state.units[unitId]);
export const getEnemyUnits = (state: GameState) => {
    const activeUnitIds = getActivePlayer(state).unitIds;
    const units = state.units;
    const enemyUnits = Object.keys(units)
        .filter(key => !activeUnitIds.includes(key))
        .map(key => units[key]);
    return enemyUnits;
};
export const getGridGlows = createSelector(getSelectedUnit, getUnitList, state => gridDimensions(state.grid), generateGridGlows);
export const getGridColors = createSelector(getSelectedUnit, getUnitList, state => gridDimensions(state.grid), generateGridColors);

export default gameSlice.reducer;
