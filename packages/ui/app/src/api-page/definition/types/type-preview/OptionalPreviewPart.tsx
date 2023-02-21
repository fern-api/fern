import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import { TypePreviewPart } from "./TypePreviewPart";

export declare namespace OptionalPreviewPart {
    export interface Props {
        optional: FernRegistry.OptionalType;
        includeContainerItems: boolean;
    }
}

export const OptionalPreviewPart: React.FC<OptionalPreviewPart.Props> = ({ optional, includeContainerItems }) => {
    if (!includeContainerItems) {
        return <span>optional</span>;
    }

    return (
        <span>
            optional
            <span className="inline-block w-[3px]" />
            <TypePreviewPart type={optional.itemType} includeContainerItems={includeContainerItems} />
        </span>
    );
};
