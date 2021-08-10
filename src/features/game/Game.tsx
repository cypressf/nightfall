import React from "react";
import { useSelector } from "react-redux"
import { useAppDispatch } from "../../app/hooks";
import { RootState } from "../../app/store";
import { moveUnit } from "./gameSlice";

export function Game() {
    const { unit } = useSelector((state: RootState) => state.game);
    const dispatch = useAppDispatch();
    return (
        <React.Fragment>
            <p>position: {unit.position.x}, {unit.position.y}</p>
            <button onClick={() => dispatch(moveUnit({
                x: unit.position.x + 1,
                y: unit.position.y
            }
            ))}>move up</button>
        </React.Fragment>
    );
}