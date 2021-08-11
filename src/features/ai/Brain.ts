import Unit from  "../unit/Unit";
import {Position} from "../game/Position";

const head = (unit:Unit)=>{
  return unit.positions[unit.positions.length-1];
}

const manDistance=(pos1:Position,pos2: Position)=>{
  return Math.abs(pos1.x-pos2.x) + Math.abs(pos2.y-pos2.y);
}

const unitDistance=(unit1:Unit,unit2:Unit)=>{
  let minSection=unit2.positions[0];
  let minDistance= manDistance(head(unit1),minSection);
  for(let targetSection of unit2.positions){
    const distance = manDistance(head(unit1), targetSection);
    if (distance<minDistance){
      minDistance=distance;
      minSection =targetSection;
    }
  }
  return {
    distance:minDistance,
    position:minSection,
  }
}

const isWithinRange=(attacker:Unit, defender:Unit)=>{
  const {distance, position} = unitDistance(attacker, defender);
  return distance < attacker.stats.range + attacker.stats.movement;
}
