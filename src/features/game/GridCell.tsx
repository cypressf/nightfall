import { moveUnit } from "./gameSlice";
import styles from './Game.module.css';
import { useAppDispatch } from "../../app/hooks";
import {Position} from "./Position";


type Props = {
    position: Position,
    active: boolean,
};

export const GridCell = ({ position, active }: Props) => {
    const dispatch = useAppDispatch();
    return <div
        key={position.x + "," + position.y}
        className={active ? styles.active : undefined}
        onClick={() => dispatch(moveUnit(position))}
    >{position.x + " " + position.y}</div>;
}
