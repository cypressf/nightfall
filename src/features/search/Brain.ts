import Unit from "../unit/Unit";
import { Position, posEquals } from "../game/Position";
import { overlapsAnything } from "../game/gameSlice";
import { Grid, inGrid } from "../game/Grid";


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

const inBounds = (positions: Position[], grid:Grid) => {
  return positions.filter(pos => inGrid(grid,pos));
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
  if (mover.attackUsed) {
    return [];
  }
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
