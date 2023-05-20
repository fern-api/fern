import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import React from "react";
import { useApiDefinitionContext } from "../../../../api-context/useApiDefinitionContext";
import { TypeShorthand } from "./TypeShorthand";

export declare namespace ReferencedTypePreviewPart {
    export interface Props {
        typeId: FernRegistryApiRead.TypeId;
        plural: boolean;
    }
}

export const ReferencedTypePreviewPart: React.FC<ReferencedTypePreviewPart.Props> = ({ typeId, plural }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const shape = resolveTypeById(typeId).shape;

    return (
        <>
            {shape._visit<JSX.Element | string>({
                alias: (typeReference) => <TypeShorthand type={typeReference} plural={plural} />,
                object: () => (plural ? "objects" : "object"),
                undiscriminatedUnion: () => (plural ? "unions" : "union"),
                discriminatedUnion: () => (plural ? "unions" : "union"),
                enum: () => (plural ? "enums" : "enum"),
                _other: () => "<unknown>",
            })}
        </>
    );
};
