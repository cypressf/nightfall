import { attack, moveUnit, selectUnit, unitAt } from "./gameSlice";
import { useAppDispatch } from "../../app/hooks";
import { Position } from "./Position";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";
import Unit from "../unit/Unit";


type Props = {
    position: Position,
    color?: string,
};

const isEmpty = (position: Position, units: Unit[]) => unitAt(position, units) === undefined;

export const GridCell = ({ position, color }: Props) => {
    const dispatch = useAppDispatch();
    const { units } = useSelector((state: RootState) => state.game);
    const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        switch (event.button) {
            case 0:
                if (isEmpty(position, Object.values(units))) {
                    dispatch(moveUnit(position)); break;
                } else {
                    dispatch(selectUnit(position)); break;
                }
            case 2:
                dispatch(attack(position));
                event.preventDefault();
                break;

        };
    }
    return <div
        style={{ backgroundColor: color }}
        onContextMenu={handleClick}
        onClick={handleClick}
    ></div>;
}
