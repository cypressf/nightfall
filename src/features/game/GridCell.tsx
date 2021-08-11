import { attack, moveUnit, selectUnit } from "./gameSlice";
import { useAppDispatch } from "../../app/hooks";
import { Position } from "./Position";
import { useSelector } from "react-redux";
import { RootState } from "../../app/store";


type Props = {
    position: Position,
    color?: string,
};

export const GridCell = ({ position, color }: Props) => {
    const dispatch = useAppDispatch();
    const { phase } = useSelector((state: RootState) => state.game);
    const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
        switch (phase) {
            case "action":
                switch (event.button) {
                    case 0:
                        dispatch(moveUnit(position)); break;
                    case 2:
                        dispatch(attack(position));
                        event.preventDefault();
                        break;

                }; break;
            case "select":
                dispatch(selectUnit(position)); break;
        }
    }
    return <div
        style={{ backgroundColor: color }}
        onContextMenu={handleClick}
        onClick={handleClick}
    >{position.x + " " + position.y}</div>;
}
