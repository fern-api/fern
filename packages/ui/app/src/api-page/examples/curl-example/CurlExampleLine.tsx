import React from "react";
import { JsonExampleLine } from "../json-example/JsonExampleLine";
import { CurlExamplePart } from "./CurlExamplePart";

export declare namespace CurlExampleLine {
    export interface Props {
        part: CurlExamplePart.Line;
        indentInSpaces: number;
        isLastPart: boolean;
    }
}

export const CurlExampleLine: React.FC<CurlExampleLine.Props> = ({ part, indentInSpaces, isLastPart }) => {
    const { excludeTrailingBackslash = false, excludeIndent = false } = part;

    return (
        <JsonExampleLine>
            {" ".repeat(excludeIndent ? 0 : indentInSpaces)}
            {part.value}
            {!excludeTrailingBackslash && !isLastPart && <>{" \\"}</>}
        </JsonExampleLine>
    );
};
