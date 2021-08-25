import Unit from "../unit/Unit";
import { Position, posEquals } from "../game/Position";
import { overlapsAnything } from "../game/gameSlice";
import { Grid, inGrid } from "../game/Grid";


export const head = (unit: Unit) => {
  return unit.positions[unit.positions.length - 1];
}

/**
 * Given a attacker unit and a target position, can that unit attack that position?
 * @param attacker 
 * @param target 
 * @returns 
 */
export const targetInRange = (attacker: Unit, target: Position) => {
  const attackerHead = head(attacker);
  return Math.abs(attackerHead.x - target.x) + Math.abs(attackerHead.y - target.y) <= attacker.stats.range;
}

export const withinAttackRange = (attacker: Unit) => {
  return withinRange(head(attacker), attacker.stats.range);
}

/**
 * Filter a list of positions to only those that are in the grid. This includes holes.  
 */
const inBounds = (positions: Position[], grid: Grid) => {
  return positions.filter(pos => inGrid(grid, pos));
}

/**
 * Filter a list of positions to only those that do no overlap anything 
 */
const empty = (positions: Position[], units: Unit[]) => {
  return positions.filter(pos => !overlapsAnything(units, pos));
}

/**
 * Filter a list of positions to only those that are not in the seen position list 
 */
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

/**
 * This has two types of operation. 
 * If the target not null, the bfs just explores all valid positions within range and returns them in seenPos.
 * If target is null, the bfs will try to explore to that position and output the path needed to get there, and if it was sucessful. 
 * In target-defined mode, the seenPos will be less useful. 
 */
export const bfs = (mover: Unit, units: Unit[], grid: Grid, target?:Position) => {
  const emptyPath: Position[] =[]; 
  const initialNode = {
    position: head(mover),
    movement: mover.stats.movement - mover.movesUsed,
    path: emptyPath,
  }
  const queue = [initialNode];
  const seenPos: Position[] = [];

  let curNode = initialNode;
  while (queue.length !== 0) {
    const nodeOrUndef = queue.shift();
    if (nodeOrUndef === undefined) {
      //Because of the length!=0 check, the shift should always have one element. 
      //This *should* be impossible to reach. 
      //But lets please the tyrannical typescript gods
      return {seenPos:[], path:[], reachTarget:false}; 
    } else {
      curNode = nodeOrUndef;
    }

    if (!posEquals(curNode.position, head(mover))) {
      seenPos.push(curNode.position);
    }

    if (target!=null && posEquals(target,curNode.position)){
      return {seenPos, path:curNode.path, reachTarget:true}
    }

    if (curNode.movement === 0) {
      continue; //Stop right there, yall aint got none movement
    }

    const nearPlaces = adjacent(curNode.position);
    const inPlaces = inBounds(nearPlaces, grid);
    const emptyPlaces = empty(inPlaces, units);
    const unseenPlaces = unseen(emptyPlaces, seenPos);

    for (const validPlace of unseenPlaces) {
      const newPath = curNode.path.concat([validPlace]);
      const newNode = {
        position: validPlace,
        movement: curNode.movement - 1,
        path: newPath
      }
      queue.push(newNode);
    }
  }
  return {seenPos, path:curNode.path, reachTarget:false};
}
