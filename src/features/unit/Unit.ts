import {Position} from "../game/Position";

export interface Unit {
    stats:{
      maxLength: number;
      range: number;
      movement: number;
      attack: number;
      name: string;
    }
    length: number;
    position: Position;
};
