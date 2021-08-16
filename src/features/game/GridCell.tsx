import { attack, move, select, unitAt, getUnitList } from "./gameSlice";
import { useAppDispatch } from "../../app/hooks";
import { Position } from "./Position";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import Unit from "../unit/Unit";


type Props = {
    position: Position,
    color?: string,
    glowColor?: string,
};

const isEmpty = (position: Position, units: Unit[]) => unitAt(position, units) === undefined;

export const GridCell = ({ position, color, glowColor }: Props) => {
    const dispatch = useAppDispatch();
    const units = useSelector((state: RootState) => getUnitList(state.game));
    const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
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
    }
    return <div
        style={{
            backgroundColor: color,
            boxShadow: "0px 0px 10px" + glowColor,
        }}
        onContextMenu={handleClick}
        onClick={handleClick}
    ></div>;
}
