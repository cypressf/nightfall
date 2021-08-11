import { moveUnit, selectUnit } from "./gameSlice";
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

    return <div
        style={{ backgroundColor: color }}
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
