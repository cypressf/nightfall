import { createSelector, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Unit from "../unit/Unit";
import { Position, posHash } from "./Position";
import { generateGridInfo, unitBfs, head, targetInRange, positionsWithinUnitRange, aiSubTurn } from "../search/Brain";
import { Grid, inGrid, rectGridConstructor } from "./Grid";
import * as d3 from "d3-color";
import { RootState } from "../../app/store";

const UNIT_LIGHTNESS = 0.6; // 0 to 1
const UNIT_SATURATION = 1; // 0 to 2

const unitColor = (hue: number) => {
    return d3.cubehelix(hue, UNIT_SATURATION, UNIT_LIGHTNESS).toString();
}

const unitHeadColor = (hue: number) => {
    return d3.cubehelix(hue, UNIT_SATURATION + 0.2, UNIT_LIGHTNESS - 0.3).toString();
}

export type PlayerType = "human" | "ai";

export type Player = {
    name: string;
    unitIds: string[];
    type: PlayerType;
}

export type Phase = "move" | "attack" | "game over";

export interface GameState {
    turn: number;
    units: { [key: string]: Unit };
    selectedUnit?: string;
    grid: Grid;
    winner?: string;
    phase: Phase;
    players: Player[];
};

const defaultUnits2 : Unit[] =[{
    positions: [{ x: 0, y: 0 }],
    movesUsed: 0,
    attackUsed: false,
    stats:{
        name: "3Range",
        maxLength: 1,
        range: 3,
        movement: 2,
        attack: 1,
        color: unitColor(0),
        headColor: unitHeadColor(0),
        id: "a",
    }
},
{
    positions: [{ x: 0, y: 2 }],
    movesUsed: 0,
    attackUsed: false,
    stats:{
        name: "2Range",
        maxLength: 1,
        range: 2,
        movement: 2,
        attack: 1,
        color: unitColor(30),
        headColor: unitHeadColor(30),
        id: "b",
    }
},
{
    positions: [{ x: 0, y: 4 }],
    movesUsed: 0,
    attackUsed: false,
    stats:{
        name: "1Range",
        maxLength: 1,
        range: 1,
        movement: 2,
        attack: 1,
        color: unitColor(60),
        headColor: unitHeadColor(60),
        id: "c",
    }
},
{
    positions: [{ x: 3, y: 0 },{x:4,y:0},{x:5,y:0}],
    movesUsed: 0,
    attackUsed: false,
    stats:{
        name: "1Target",
        maxLength: 3,
        range: 1,
        movement: 1,
        attack: 1,
        color: unitColor(500),
        headColor: unitHeadColor(500),
        id: "x",
    }
},
{
    positions: [{ x: 3, y: 2 },{x:4,y:2},{x:5,y:2}],
    movesUsed: 0,
    attackUsed: false,
    stats:{
        name: "2Target",
        maxLength: 3,
        range: 1,
        movement: 1,
        attack: 1,
        color: unitColor(530),
        headColor: unitHeadColor(530),
        id: "y",
    }
},
{
    positions: [{ x: 3, y: 4 },{x:4,y:4},{x:5,y:4}],
    movesUsed: 0,
    attackUsed: false,
    stats:{
        name: "3Target",
        maxLength: 3,
        range: 1,
        movement: 1,
        attack: 1,
        color: unitColor(560),
        headColor: unitHeadColor(560),
        id: "z",
    }
},
]

const defaultUnits: Unit[] = [{
    positions: [{ x: 0, y: 0 }],
    movesUsed: 0,
    attackUsed: false,
    stats: {
        name: "Heavy hitter",
        maxLength: 5,
        range: 1,
        movement: 2,
        attack: 3,
        color: unitColor(0),
        headColor: unitHeadColor(0),
        id: "a",
    }
},
{
    positions: [{ x: 4, y: 4 }],
    movesUsed: 0,
    attackUsed: false,
    stats: {
        name: "Ranged and slow",
        maxLength: 2,
        range: 3,
        movement: 1,
        attack: 1,
        color: unitColor(100),
        headColor: unitHeadColor(100),
        id: "b",
    }
},
{
    positions: [{ x: 9, y: 9 }],
    movesUsed: 0,
    attackUsed: false,
    stats: {
        name: "Glass cannon",
        maxLength: 1,
        range: 1,
        movement: 5,
        attack: 2,
        color: unitColor(200),
        headColor: unitHeadColor(200),
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

export type Direction = "up" | "down" | "left" | "right";

export type GridInfo = {
    position: { x: number, y: number };
    unit?: Unit,
    unitType?: "ally" | "enemy",
    unitSelected?: boolean,
    unitLink?: Direction,
    unitHead?: boolean,
    showMoveHighlight?: boolean,
    showAttackHighlight?: boolean,
    showImmediateMove?: Direction,
}

const initialGrid = rectGridConstructor(10, 10);
initialGrid["6-6"] = false;
initialGrid["6-5"] = false;
const initialUnits = defaultUnits2.reduce((map: { [key: string]: Unit }, unit) => {
    map[unit.stats.id] = unit;
    return map;
}, {});
const initialState: GameState = {
    turn: 0,
    phase: "move",
    grid: initialGrid,
    units: initialUnits,
    selectedUnit: "a",
    players: [
        {
            name: "Jake",
            unitIds: ["a", "b", "c"],
            type: "ai",
        },
        {
            name: "Cypress",
            unitIds: ["x","y","z"],
            type:"human",
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

const locationValid = (grid: Grid, units: Unit[], unit: Unit, newPosition: Position) => {
    const oldPositions = unit.positions;
    const oldHead = oldPositions[oldPositions.length - 1];
    return Math.abs(newPosition.x - oldHead.x) +
        Math.abs(newPosition.y - oldHead.y) <= 1 &&
        !overlapsAnything(units, newPosition) && inGrid(grid, newPosition);
}

export const unitAt = (position: Position, units: Unit[]) => {
    for (const unit of units) {
        if (overlaps(unit.positions, position)) {
            return unit;
        }
    }
}

const moveAction =  (state: GameState, action: PayloadAction<Position>) => {
    if (state.phase !== "move" || state.selectedUnit === undefined) {
        return;
    }
    const unit = state.units[state.selectedUnit];
    if (unit.movesUsed >= unit.stats.movement) {
        return;
    }
    const units = getUnitList(state);
    if (locationValid(state.grid, units, unit, action.payload)) {
        unit.positions.push(action.payload);
        unit.movesUsed++;
    }
    if (unit.positions.length > unit.stats.maxLength) {
        unit.positions.shift();
    }
    if (unit.movesUsed === unit.stats.movement) {
        state.phase = "attack";
    }
};

const selectAction =  (state: GameState, action: PayloadAction<Position>) => {
    const activeUnits = getActivePlayerUnits(state);
    const selectedUnit = unitAt(action.payload, activeUnits);
    if (selectedUnit) {
        state.selectedUnit = selectedUnit.stats.id;
        selectedUnit.movesUsed < selectedUnit.stats.maxLength ?
            state.phase = "move" :
            state.phase = "attack";
    }
};

const attackAction = (state: GameState, action: PayloadAction<Position>) => {
    const targetPosition = action.payload;
    const enemyUnits = getEnemyUnits(state);
    const target = unitAt(targetPosition, enemyUnits);
    if (state.phase !== "attack" || state.selectedUnit === undefined || !target) {
        return;
    }
    const attacker = state.units[state.selectedUnit];
    if (attacker === target || attacker.attackUsed || !targetInRange(attacker, targetPosition)) {
        return;
    }
    attacker.attackUsed = true;
    if (attacker.stats.attack >= target.positions.length) {
        delete state.units[target.stats.id];
        deleteDeadPlayers(state);
        if (state.players.length < 2) {
            state.winner = state.players[0].name;
            state.phase = "game over";
        }
    }
    target.positions.splice(0, attacker.stats.attack);
};

const endTurnAction = (state: GameState) => {
    state.turn++;
    for (const unit of getUnitList(state)) {
        unit.movesUsed = 0;
        unit.attackUsed = false;
    };
    state.selectedUnit = getActivePlayerUnits(state)[0].stats.id;
    state.phase = "move";
};

export const gameSlice = createSlice({
    name: 'game',
    initialState,
    reducers: {
        aiTurn: (state: GameState, action: PayloadAction<Player>) =>{
            const activeUnits = getActivePlayerUnits(state);
            const enemyUnits = getEnemyUnits(state);
            const units = getUnitList(state);
            aiSubTurn(activeUnits, enemyUnits, units, state.grid, state, moveAction, selectAction, attackAction, endTurnAction);
        },
        move: moveAction,
        select:selectAction,
        reset: () => {
            return initialState;
        },
        attack: attackAction,
        endTurn: endTurnAction,
        clickMove: (state: GameState) => {
            const selectedUnit = getSelectedUnit(state);
            if (selectedUnit && selectedUnit.movesUsed < selectedUnit.stats.movement) {
                state.phase = "move";
            }
        },
        clickAttack: (state: GameState) => {
            const selectedUnit = getSelectedUnit(state);
            if (selectedUnit && !selectedUnit.attackUsed) {
                state.phase = "attack";
            }
        },
    },
});

export const { aiTurn, move, select, attack, reset, endTurn, clickMove, clickAttack } = gameSlice.actions;

// Getters
const getUnitList = (state: GameState) => Object.values(state.units);
const getActivePlayerUnits = (state: GameState) => getUnitsForPlayer(state, getActivePlayer(state));
const getUnitsForPlayer = (state: GameState, player: Player) =>
    player
        .unitIds
        .map(unitId => state.units[unitId])
        .filter(unit => unit !== undefined);
const getActivePlayer = (state: GameState) => state.players[state.turn % state.players.length];
const getSelectedUnit = (state: GameState) => state.selectedUnit ? state.units[state.selectedUnit] : undefined;;
const getEnemyUnits = (state: GameState) => {
    const activeUnitIds = getActivePlayer(state).unitIds;
    const units = state.units;
    const enemyUnits = Object.keys(units)
        .filter(key => !activeUnitIds.includes(key))
        .map(key => units[key]);
    return enemyUnits;
};
const deleteDeadPlayers = (state: GameState) => {
    state.players = state.players.filter(player => getUnitsForPlayer(state, player).length > 0);
}

// Regular Selectors
export const selectUnitList = (state: RootState) => getUnitList(state.game);
export const selectActivePlayerUnits = (state: RootState) => getActivePlayerUnits(state.game);
export const selectActivePlayer = (state: RootState) => getActivePlayer(state.game);
export const selectSelectedUnit = (state: RootState) => getSelectedUnit(state.game);
export const selectEnemyUnits = (state: RootState) => getEnemyUnits(state.game);

// Cached Selectors
export const selectGridInfo = createSelector(selectSelectedUnit, state => state.game.phase, selectUnitList, state => state.game.grid, selectActivePlayer, generateGridInfo);

export default gameSlice.reducer;
