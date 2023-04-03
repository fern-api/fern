import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { EnglishTypeShapeSummary } from "./english-summary/EnglishTypeShapeSummary";
import { ReferencedTypePreviewPart } from "./type-preview/ReferencedTypePreviewPart";

export declare namespace TypeDefinition {
    export interface Props {
        typeId: FernRegistry.TypeId;
    }
}

export const TypeDefinition: React.FC<TypeDefinition.Props> = ({ typeId }) => {
    const { resolveTypeById } = useApiDefinitionContext();

    const typeDefinition = useMemo(() => resolveTypeById(typeId), [resolveTypeById, typeId]);

    return (
        <div className="border border-gray-300 rounded">
            <div className="flex justify-between p-2">
                <div>
                    <ReferencedTypePreviewPart typeId={typeId} />
                    {" is "}
                    <EnglishTypeShapeSummary shape={typeDefinition.shape} />
                </div>
                <div className="text-green-600">5 properties</div>
            </div>
        </div>
    );
};
