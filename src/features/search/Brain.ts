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
  return manDistance(attackerHead,target) <= attacker.stats.range;
}

export const manDistance = (pos1: Position, pos2 : Position) => {
  return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y)
}

export const positionsWithinUnitRange = (attacker: Unit) => {
  return positionsWithinRange(head(attacker), attacker.stats.range);
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

const positionsWithinRange = (position: Position, distance: number) => {
  const toReturn = [];
  for (let x = -distance; x <= distance; x++) {
    for (let y = -distance + Math.abs(x); y <= distance - Math.abs(x); y++) {
      toReturn.push({
        x: position.x + x,
        y: position.y + y
      });
    }
  }
  return toReturn;
}

const adjacent = (position: Position) => positionsWithinRange(position, 1);



export const aiSubTurn = (aiUnits: Unit[], enemyUnits:Unit[], units: Unit[], grid:Grid) =>{
  //Make a 'mapping' of which units can hit which other units and how.
  const whoCanHitWhat=[];
  for(const aiUnit of aiUnits){
    for(const enemyUnit of enemyUnits){
      const {minPath, minPos}=unitFirePathBfs(aiUnit, enemyUnit, units, grid);
      const possibleAction = {
        attacker: aiUnit,
        defender: enemyUnit,
        minPath: minPath, 
        minPos: minPos,
      }
      whocanHitWhat
    }
    canUnitHitUnit
  }
}

// const activePlayerUnits = useSelector(selectActivePlayerUnits);

//Generally find a path between a start and target position, without any max length.
export const pathBfs = (start:Position,target:Position, units: Unit[], grid: Grid) =>{
  return bfsHelper(start,Infinity,units,grid,target);
}

//Given a particular unit, path with it to a target, or get available movement squares if target is null
export const unitBfs = (mover: Unit, units: Unit[], grid: Grid, target?:Position)=>{
  return bfsHelper(head(mover),mover.stats.movement - mover.movesUsed,units,grid,target)
} 

//Given an attacking unit and a defending unit, how does the attacker path to within firing range of the defender?
export const unitFirePathBfs = (attacker: Unit, defender: Unit, units: Unit[], grid: Grid)=>{
  let minPath=null;
  let minPos= null;
   for (const targetPos of defender.positions){
    const {seenPos, path, reachTarget}=bfsHelper(head(attacker), attacker.stats.movement - attacker.movesUsed, units, grid, targetPos, attacker.stats.range);
    if (reachTarget && path !== undefined && (minPath==null || path.length < minPath.length)){
      minPath =  path;
      minPos  = targetPos;
    }
   }
   return {minPath, minPos};
}

/**
 * This has two types of operation. 
 * If the target not null, the bfs just explores all valid positions within range and returns them in seenPos.
 * If target is null, the bfs will try to explore to that position and output the path needed to get there, and if it was sucessful. 
 * In target-defined mode, the seenPos will be less useful. 
 */
export const bfsHelper = (start:Position, maxPathLength:number, units: Unit[], grid: Grid, target?:Position, targetDistance:number=0) => {
  const emptyPath: Position[] =[]; 
  const initialNode = {
    position: start,
    movement: maxPathLength,
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

    if (!posEquals(curNode.position, start)) {
      seenPos.push(curNode.position);
    }

    if (target!=null && manDistance(target,curNode.position) <= targetDistance){
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
