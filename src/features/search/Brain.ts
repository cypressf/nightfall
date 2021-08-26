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

export const closePositionBetweenUnits= (unit1: Unit, unit2:Unit)=> {
  const unit1Head = head(unit1);
  let minDis = Infinity;
  let minPos = null;
  for (const pos of unit2.positions){
    const dis=manDistance(unit1Head, pos);
    if (dis<minDis){
      minDis=dis;
      minPos=pos;
    }
  }
  return {minPos, minDis};
}

//Given units 1 and 2, find the shortest path from 1 to any part on 2.
export const shortestPathToUnit = (unit1:Unit, unit2:Unit, units: Unit[], grid: Grid) =>{
  const unit1Head = head(unit1);
  let minDis = Infinity;
  let minPath = null;
  for (const pos of unit2.positions){
    const bfsInfo=pathBfs(unit1Head, pos, units, grid);
    if (!bfsInfo.reachTarget){
      //Unreachable. There are some interesting geometries where one position of a unit is unreachable but another is not.
      continue;
    }
    const dis=bfsInfo.path.length;
    if (dis < minDis){
      minDis=dis;
      minPath=bfsInfo.path;
    }
  }
  return minPath;
}

/**
 * Using both movement and attack range if needed, determine what one unit could do to another, with details of move and attack positions
 */
 export const moveInfo=(attacker: Unit, defender: Unit, units:Unit[], grid:Grid ) =>{
  const {minPos, minDis}= closePositionBetweenUnits(attacker,defender);
  const dmg=attacker.stats.attack;
  const canKill = unfortunateOne.positions.length-dmg <= 0;
  if (minDis <= attacker.stats.range){
    //Can hit without movement
    return {minDis, canKill, movePos:null, atkPos:minPos, dmg:attacker.stats.attack}
  }else{
    //Might need to move first. Step 1, find the shortest path to the enemy unit.
    //The closest segment might not be reachable so we have to bfs all positions
    const shortestPath = shortestPathToUnit(attacker, defender, units, grid);
    if (shortestPath==undefined){
      //There is no path to the unit and can't hit it with just range. 
      //There is a edge case here where the enemy is on an island and you just want to get close enough to fire at them. 
      return {minDis:Infinity,canKill:false,movePos:null,atkPos:null,dmg:0};
    }
    
  }
 }

/**
 * If unit can hit another, return the min distance and pos to the second, otherwise return null
 */
export const moveInfo=(attacker: Unit, unfortunateOne: Unit) =>{
  const {minDis, minPos} = closePositionBetweenUnits(attacker,unfortunateOne);
  if (minDis <= attacker.stats.range){
    const dmg=attacker.stats.attack;
    const canKill = unfortunateOne.positions.length-dmg <= 0;
    return {minPos, minDis, canKill, dmg:attacker.stats.attack};
  }else{
    return null;
  }
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

export const aiTurn = (aiUnits: Unit[], enemyUnits:Unit[]) =>{
  //Make a 'mapping' of which units can hit which other units.
  const whoCanHitWhat=[];
  for(const aiUnit of aiUnits){
    for(const enemyUnit of enemyUnits){
      const canHitInfo = 
      whocanHitWhat
    }
    canUnitHitUnit
  }
}

const activePlayerUnits = useSelector(selectActivePlayerUnits);

//Generally find a path between a start and target position, without any max length.
export const pathBfs = (start:Position,target:Position, units: Unit[], grid: Grid) =>{
  return bfsHelper(start,Infinity,units,grid,target);
}

//Given a particular unit, path with it to a target, or get available movement squares if target is null
export const unitBfs = (mover: Unit, units: Unit[], grid: Grid, target?:Position)=>{
  return bfsHelper(head(mover),mover.stats.movement - mover.movesUsed,units,grid,target)
} 

/**
 * This has two types of operation. 
 * If the target not null, the bfs just explores all valid positions within range and returns them in seenPos.
 * If target is null, the bfs will try to explore to that position and output the path needed to get there, and if it was sucessful. 
 * In target-defined mode, the seenPos will be less useful. 
 */
export const bfsHelper = (start:Position, maxPathLength:number, units: Unit[], grid: Grid, target?:Position) => {
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
