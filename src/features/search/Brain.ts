import Unit from "../unit/Unit";
import { Position, posEquals } from "../game/Position";
import { overlapsAnything } from "../game/gameSlice";


const head = (unit: Unit) => {
  return unit.positions[unit.positions.length - 1];
}

const manDistance = (pos1: Position, pos2: Position) => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos2.y - pos2.y);
}

const unitDistance = (unit1: Unit, unit2: Unit) => {
  let minSection = unit2.positions[0];
  let minDistance = manDistance(head(unit1), minSection);
  for (let targetSection of unit2.positions) {
    const distance = manDistance(head(unit1), targetSection);
    if (distance < minDistance) {
      minDistance = distance;
      minSection = targetSection;
    }
  }
  return {
    distance: minDistance,
    position: minSection,
  }
}

const isWithinRange = (attacker: Unit, defender: Unit) => {
  const { distance, position } = unitDistance(attacker, defender);
  return distance < attacker.stats.range + attacker.stats.movement;
}

const inBounds = (positions: Position[], width: number, height: number) => {
  return positions.filter(pos => pos.x >= 0 && pos.x < width && pos.y >= 0 && pos.y < height);
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

const adjacent = (pos: Position) => {
  return [
    { x: pos.x, y: pos.y - 1 },
    { x: pos.x, y: pos.y + 1 },
    { x: pos.x + 1, y: pos.y },
    { x: pos.x - 1, y: pos.y },
  ]
}

export const bfs = (mover: Unit, units: Unit[], gridSize: { width: number, height: number }) => {
  if (mover.attackUsed) {
    return [];
  }
  const initialNode = {
    position: head(mover),
    movement: mover.stats.movement - mover.movesUsed,
  }
  const { width, height } = gridSize;

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
    const inPlaces = inBounds(nearPlaces, width, height);
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
