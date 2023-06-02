import React, { useMemo } from "react";
import { CurlExampleLine } from "./CurlExampleLine";
import { CurlExamplePart } from "./CurlExamplePart";

export declare namespace CurlExampleLines {
    export interface Props {
        parts: CurlExamplePart[];
    }
}

const CURL_PREFIX = "curl ";

export const CurlExampleLines: React.FC<CurlExampleLines.Props> = ({ parts }) => {
    const allPartsIncludeCurlCommand = useMemo((): CurlExamplePart[] => {
        const [firstPart, ...remainingParts] = parts;
        if (firstPart?.type === "stringLine") {
            return [
                {
                    ...firstPart,
                    value: CURL_PREFIX + firstPart.value,
                },
                ...remainingParts,
            ];
        } else {
            return [
                {
                    type: "stringLine",
                    value: CURL_PREFIX,
                },
                ...parts,
            ];
        }
    }, [parts]);

    return (
        <>
            {allPartsIncludeCurlCommand.map((part, index) => (
                <CurlExampleLine
                    key={index}
                    part={part}
                    indent={index > 0 ? CURL_PREFIX.length : 0}
                    isLastPart={index === allPartsIncludeCurlCommand.length - 1}
                />
            ))}
        </>
    );
};
