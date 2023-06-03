import React from "react";
import { JsonExampleLine } from "../json-example/JsonExampleLine";
import { CurlExamplePart } from "./CurlExamplePart";

export declare namespace CurlExampleLine {
    export interface Props {
        part: CurlExamplePart;
        indent: number;
        isLastPart: boolean;
    }
}

export const CurlExampleLine: React.FC<CurlExampleLine.Props> = ({ part, indent, isLastPart }) => {
    const { excludeTrailingBackslash = false, excludeIndent = false } = part;
    return (
        <JsonExampleLine>
            {excludeIndent || repeat((index) => <React.Fragment key={index}>&nbsp;</React.Fragment>, indent)}
            {part.value}
            {!excludeTrailingBackslash && !isLastPart && <>&nbsp;{"\\"}</>}
        </JsonExampleLine>
    );
};

function repeat<T>(generate: (index: number) => T, count: number): T[] {
    const elements = [];
    for (let i = 0; i < count; i++) {
        elements.push(generate(i));
    }
    return elements;
}
