import React from "react";
import { JsonExampleLine } from "../json-example/JsonExampleLine";
import { CurlExamplePart } from "./CurlExamplePart";

export declare namespace CurlExampleLine {
    export interface Props {
        part: CurlExamplePart;
        indentInSpaces: number;
        isLastPart: boolean;
    }
}

export const CurlExampleLine: React.FC<CurlExampleLine.Props> = ({ part, indentInSpaces, isLastPart }) => {
    const { excludeTrailingBackslash = false, excludeIndent = false } = part;

    const indentToRender = excludeIndent ? 0 : indentInSpaces;
    const shouldRenderTrailingSlash = !excludeTrailingBackslash && !isLastPart;

    if (indentToRender === 0 && !shouldRenderTrailingSlash && typeof part.value !== "string") {
        return part.value;
    }

    return (
        <JsonExampleLine>
            {" ".repeat(indentToRender)}
            {part.value}
            {shouldRenderTrailingSlash && <>{" \\"}</>}
        </JsonExampleLine>
    );
};
