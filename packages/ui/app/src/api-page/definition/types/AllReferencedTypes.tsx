import { FernRegistry } from "@fern-fern/registry";
import { useCallback } from "react";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinitionContext, TypeDefinitionContextValue } from "./context/TypeDefinitionContext";
import { InternalAllReferencedTypes } from "./InternalAllReferencedTypes";

export declare namespace AllReferencedTypes {
    export interface Props {
        type: FernRegistry.TypeReference;
        isCollapsible: boolean;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        className?: string;
    }
}

export const AllReferencedTypes: React.FC<AllReferencedTypes.Props> = ({
    type,
    isCollapsible,
    onHoverProperty,
    className,
}) => {
    const contextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            isRootTypeDefinition: true,
            jsonPropertyPath: [],
            onHoverProperty,
        }),
        [onHoverProperty]
    );

    return (
        <TypeDefinitionContext.Provider value={contextValue}>
            <InternalAllReferencedTypes type={type} isCollapsible={isCollapsible} className={className} />
        </TypeDefinitionContext.Provider>
    );
};
