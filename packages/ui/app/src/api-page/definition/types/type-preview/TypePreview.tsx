import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import { TypePreviewPart } from "./TypePreviewPart";

export declare namespace TypePreview {
    export interface Props {
        type: FernRegistry.TypeReference;
        includeContainerItems?: boolean;
    }
}

export const TypePreview: React.FC<TypePreview.Props> = ({ type, includeContainerItems = false }) => {
    return <TypePreviewPart type={type} includeContainerItems={includeContainerItems} />;
};
