import { Position, revHash } from "./Position";
import { posHash } from "./Position";

export type Grid =  {
    [key: string]:boolean
};

export const gridDimensions = (grid: Grid) =>{
    let maxX=-1000;
    let maxY=-1000;
    for(let key of Object.keys(grid)){
        const {x,y}=revHash(key);
        if (x>maxX){
            maxX=x;
        }
        if(y>maxY){
            maxY=y;
        }
    }
    return {width:maxX+1,height:maxY+1};
}

export const positionOfGrid = (i: number, grid:Grid) => {
    const gridSize=gridDimensions(grid);
    const x = Math.floor(i / gridSize.width);
    const y = i % gridSize.height;
    return { x, y };
}

export const inGrid = (grid:Grid, pos: Position) =>{
    return grid.hasOwnProperty(posHash(pos));
}

export const rectGridConstructor = (width:number, height:number) => {
    const toReturn : Grid ={};
    for(let i=0; i<width; i+=1){
        for(let j=0; j<height; j+=1){
            toReturn[posHash({x:i,y:j})]=true;
        }
    }
    return toReturn;
}