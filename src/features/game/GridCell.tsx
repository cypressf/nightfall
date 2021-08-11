import { moveUnit, selectUnit } from "./gameSlice";
import styles from './Game.module.css';
import { useAppDispatch } from "../../app/hooks";
import { Position } from "./Position";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";


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
    const { phase } = useSelector((state: RootState) => state.game);

    return <div
        className={getClass(isActive, isHead).join(" ")}
        onClick={() => {
            switch (phase) {
                case "action":
                    dispatch(moveUnit(position));
                    break;
                case "select":
                    dispatch(selectUnit(position));
                    break;
            }

        }}
    >{position.x + " " + position.y}</div>;
}
