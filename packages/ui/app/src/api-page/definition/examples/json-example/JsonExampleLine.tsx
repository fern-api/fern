import { PropsWithChildren, useContext } from "react";
import { JsonExampleDepthContext } from "./contexts/JsonExampleDepthContext";

export declare namespace JsonExampleLine {
    export type Props = PropsWithChildren<{
        className?: string;
    }>;
}

export const JsonExampleLine: React.FC<JsonExampleLine.Props> = ({ className, children }) => {
    const { depth } = useContext(JsonExampleDepthContext);

    return (
        <div className={className} style={{ paddingLeft: 15 * depth }}>
            {children}
        </div>
    );
};
