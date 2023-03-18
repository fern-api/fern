import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import { TypePreviewPart } from "./TypePreviewPart";

export declare namespace TypePreview {
    export interface Props {
        type: FernRegistry.Type;
        includeContainerItems?: boolean;
    }
}

export const TypePreview: React.FC<TypePreview.Props> = ({ type, includeContainerItems = false }) => {
    return (
        <div className="flex text-green-700">
            <TypePreviewPart type={type} includeContainerItems={includeContainerItems} />
        </div>
    );
};
