import { FernRegistry } from "@fern-fern/registry";
import React from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { TypeString } from "./TypeString";

export declare namespace ReferencedTypePreviewPart {
    export interface Props {
        typeId: FernRegistry.TypeId;
    }
}

export const ReferencedTypePreviewPart: React.FC<ReferencedTypePreviewPart.Props> = ({ typeId }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    return <TypeString className="text-green-700">{resolveTypeById(typeId).name}</TypeString>;
};
