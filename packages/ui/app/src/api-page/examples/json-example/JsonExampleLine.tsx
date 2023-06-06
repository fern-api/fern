import React, { PropsWithChildren, useContext } from "react";
import { JsonExampleDepthContext } from "./contexts/JsonExampleDepthContext";

const TAB_WIDTH = 2;

export const JsonExampleLine: React.FC<PropsWithChildren> = ({ children }) => {
    const { depth } = useContext(JsonExampleDepthContext);

    return (
        <div className="w-fit min-w-full pr-3">
            {" ".repeat(depth * TAB_WIDTH)}
            {children}
        </div>
    );
};
