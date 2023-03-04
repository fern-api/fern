import { Classes } from "@blueprintjs/core";
import React, { useRef } from "react";

export declare namespace SkeletonText {
    export interface Props {
        minLength?: number;
        maxLength?: number;
    }
}

export const SkeletonText: React.FC<SkeletonText.Props> = ({ minLength = 7, maxLength = 12 }: SkeletonText.Props) => {
    const delta = maxLength - minLength;
    const length = useRef(Math.round(Math.random() * delta) + minLength);

    return <span className={Classes.SKELETON}>{"X".repeat(length.current)}</span>;
};
