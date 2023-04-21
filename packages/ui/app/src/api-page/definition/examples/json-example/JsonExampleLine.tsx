import { PropsWithChildren, useContext } from "react";
import { JsonExampleDepthContext } from "./contexts/JsonExampleDepthContext";

export const JsonExampleLine: React.FC<PropsWithChildren> = ({ children }) => {
    const { depth } = useContext(JsonExampleDepthContext);

    return <div style={{ paddingLeft: 15 * depth }}>{children}</div>;
};
