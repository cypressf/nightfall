export interface Position {
    x: number;
    y: number;
}

export const posEquals=(pos1:Position,pos2:Position)=>{
  return pos1.x===pos2.x && pos1.y===pos2.y;
}

export const posHash = (pos: Position) =>{
  return pos.x+"-"+pos.y;
}
