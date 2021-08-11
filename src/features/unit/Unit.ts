import { Position } from "../game/Position";

export default interface Unit {
  stats: {
    maxLength: number;
    range: number;
    movement: number;
    attack: number;
    name: string;
    color: string;
    headColor: string;
    id: string;
  }
  positions: Position[];
  movesUsed: number;
  attackUsed: boolean;
};
