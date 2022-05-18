import Unit from "../unit/Unit";
import { Position, posEquals, posHash, revHash } from "../game/Position";
import { GridInfo, isSelected, overlapsAnything, Phase, Player } from "../game/gameSlice";
import { Grid, inGrid } from "../game/Grid";
import { isIndexSignatureDeclaration } from "typescript";


export const head = (unit: Unit) => {
  return unit.positions[unit.positions.length - 1];
}

export const isInRange = (attacker: Unit, target: Position) => {
  const attackerHead = head(attacker);
  return Math.abs(attackerHead.x - target.x) + Math.abs(attackerHead.y - target.y) <= attacker.stats.range;
}

export const withinAttackRange = (attacker: Unit) => {
  return withinRange(head(attacker), attacker.stats.range);
}

const inBounds = (positions: Position[], grid: Grid) => {
  return positions.filter(pos => inGrid(grid, pos));
}

const empty = (positions: Position[], units: Unit[]) => {
  return positions.filter(pos => !overlapsAnything(units, pos));
}

const unseen = (positions: Position[], seenPos: Position[]) => {
  return positions.filter(pos => {
    //TODO: Eww, replace with set and hash/equals implementation
    for (const otherPos of seenPos) {
      if (posEquals(pos, otherPos)) {
        return false;
      }
    }
    return true;
  })
}

const withinRange = (position: Position, distance: number) => {
  const adjacentPositions = [];
  for (let x = -distance; x <= distance; x++) {
    for (let y = -distance + Math.abs(x); y <= distance - Math.abs(x); y++) {
      adjacentPositions.push({
        x: position.x + x,
        y: position.y + y
      });
    }
  }
  return adjacentPositions;
}

const adjacent = (position: Position) => withinRange(position, 1);

export const bfs = (mover: Unit, units: Unit[], grid: Grid) => {
  const initialNode = {
    position: head(mover),
    movement: mover.stats.movement - mover.movesUsed,
  }
  const queue = [initialNode];
  const seenPos: Position[] = [];

  let curNode = initialNode;
  while (queue.length !== 0) {
    const nodeOrUndef = queue.shift();
    if (nodeOrUndef === undefined) {
      return []; //Lets please the tyrannical typescript gods
    } else {
      curNode = nodeOrUndef;
    }

    if (!posEquals(curNode.position, head(mover))) {
      seenPos.push(curNode.position);
    }

    if (curNode.movement === 0) {
      continue; //Stop right there, yall aint got none movement
    }

    const nearPlaces = adjacent(curNode.position);
    const inPlaces = inBounds(nearPlaces, grid);
    const emptyPlaces = empty(inPlaces, units);
    const unseenPlaces = unseen(emptyPlaces, seenPos);

    for (const validPlace of unseenPlaces) {
      const newNode = {
        position: validPlace,
        movement: curNode.movement - 1,
      }
      queue.push(newNode);
    }
  }
  return seenPos;
}

export const generateGridInfo = (
  selectedUnit: Unit | undefined,
  phase: Phase,
  units: Unit[],
  grid: Grid,
  activePlayer: Player
) => {
  const gridInfo: { [key: string]: GridInfo } = {};
  Object.entries(grid).forEach(([key, exists]) => {
    if (exists) gridInfo[key] = { position: revHash(key) }
  });

  units.forEach(unit => {
    const isActivePlayerUnit = activePlayer.unitIds.includes(unit.stats.id);
    unit.positions.forEach((position, i) => {
      gridInfo[posHash(position)] = {
        position,
        unit: unit,
        unitType: isActivePlayerUnit ? "ally" : "enemy",
        unitSelected: isSelected(position, selectedUnit),
        unitHead: i === 0,
        unitLink: undefined, // TODO
        showImmediateMove: undefined, // TODO
      };
    });
    if (selectedUnit && phase === "move") {
      const validMovePositions = bfs(selectedUnit, units, grid);
      validMovePositions.forEach(position => {
        gridInfo[posHash(position)] = {
          position,
          showMoveHighlight: true,
        };
      });
    }
    if (selectedUnit && phase === "attack" && !selectedUnit.attackUsed) {
      const attackPositions = withinAttackRange(selectedUnit);
      attackPositions.forEach(position => {
        const existingGridInfo = gridInfo[posHash(position)];
        if (existingGridInfo) {
          existingGridInfo.showAttackHighlight = true;
        } else {
          gridInfo[posHash(position)] = {
            position,
            showAttackHighlight: true,
          };
        }
      });
    }
  });

  return gridInfo;
}