import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { TypeShorthand } from "./TypeShorthand";

export declare namespace ReferencedTypePreviewPart {
    export interface Props {
        typeId: FernRegistry.TypeId;
    }
}

export const ReferencedTypePreviewPart: React.FC<ReferencedTypePreviewPart.Props> = ({ typeId }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const shape = resolveTypeById(typeId).shape;

    return (
        <>
            {shape._visit<JSX.Element | string>({
                alias: (typeReference) => <TypeShorthand type={typeReference} />,
                object: () => "object",
                undiscriminatedUnion: () => "union",
                discriminatedUnion: () => "union",
                enum: () => "enum",
                _other: () => "_other",
            })}
        </>
    );
};
