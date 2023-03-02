import { Classes } from "@blueprintjs/core";
import { LoadableElement } from "@fern-api/common-components";
import { Loadable } from "@fern-api/loadable";
import React from "react";

export declare namespace LoadableArrayCount {
    export interface Props {
        count: Loadable<number>;
        singularLabel: string;
        pluralLabel: string;
    }
}

export const LoadableArrayCount: React.FC<LoadableArrayCount.Props> = ({ count, singularLabel, pluralLabel }) => {
    return (
        <LoadableElement value={count} fallback={<span className={Classes.SKELETON}>XXXXXXX</span>}>
            {(loadedCount) => (
                <span>
                    {loadedCount} {loadedCount === 1 ? singularLabel : pluralLabel}
                </span>
            )}
        </LoadableElement>
    );
};
