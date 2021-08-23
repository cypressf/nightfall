import { attack, move, select, unitAt, getUnitList, Phase } from "./gameSlice";
import { useAppDispatch } from "../../app/hooks";
import { Position } from "./Position";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import Unit from "../unit/Unit";


type Props = {
    position: Position,
    color?: string,
    glowColor?: string,
    phase: Phase,
};

const isEmpty = (position: Position, units: Unit[]) => unitAt(position, units) === undefined;

export const GridCell = ({ position, color, glowColor, phase }: Props) => {
    const dispatch = useAppDispatch();
    const units = useSelector((state: RootState) => getUnitList(state.game));
    const handleClick = phase !== "game over" ? (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        switch (event.button) {
            case 0:
                if (isEmpty(position, units)) {
                    dispatch(move(position)); break;
                } else {
                    dispatch(select(position)); break;
                }
            case 2:
                dispatch(attack(position));
                event.preventDefault();
                break;

        };
    } : undefined;
    const style = {
        backgroundColor: color,
        boxShadow: glowColor ? "0px 0px 10px" + glowColor : undefined,
        transition: "background-color 0.2s",
    };
    return <div
        style={style}
        onContextMenu={handleClick}
        onClick={handleClick}
    ></div>;
}
