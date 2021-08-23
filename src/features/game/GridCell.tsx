import { attack, move, select, unitAt, selectUnitList, Phase, selectActivePlayerUnits } from "./gameSlice";
import { useAppDispatch } from "../../app/hooks";
import { Position } from "./Position";
import { useSelector } from "react-redux";
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
    const units = useSelector(selectUnitList);
    const activePlayerUnits = useSelector(selectActivePlayerUnits);
    const handleClick = () => {
        const unit = unitAt(position, units);
        if (unit && activePlayerUnits.includes(unit)) {
            dispatch(select(position));
        } else {
            switch (phase) {
                case "move":
                    if (isEmpty(position, units)) {
                        dispatch(move(position));
                    }
                    break;
                case "attack":
                    dispatch(attack(position));
                    break;
            };
        }

    };
    const style = {
        backgroundColor: color,
        boxShadow: glowColor ? "0px 0px 10px" + glowColor : undefined,
        transition: "background-color 0.2s",
    };
    return <div
        style={style}
        onClick={handleClick}
    ></div>;
}
