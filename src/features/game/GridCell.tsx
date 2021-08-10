import { moveUnit } from "./gameSlice";
import styles from './Game.module.css';
import { useAppDispatch } from "../../app/hooks";
import {Position} from "./Position";


type Props = {
    position: Position,
    isActive: boolean,
    isHead: boolean,
};

const getClass = (isActive: boolean, isHead: boolean) => {
    const classes = [];
    if (isActive) {
        classes.push(styles.active);
    }
    if (isHead) {
        classes.push(styles.head);
    }
    return classes;
}

export const GridCell = ({ position, isActive, isHead }: Props) => {
    const dispatch = useAppDispatch();
    return <div
        key={position.x + "," + position.y}
        className={getClass(isActive, isHead).join(" ")}
        onClick={() => dispatch(moveUnit(position))}
    >{position.x + " " + position.y}</div>;
}
