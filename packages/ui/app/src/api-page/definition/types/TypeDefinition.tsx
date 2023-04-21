import { FernRegistry } from "@fern-fern/registry";
import React, { useCallback } from "react";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinitionContext, TypeDefinitionContextValue } from "./context/TypeDefinitionContext";
import { InternalTypeDefinition } from "./InternalTypeDefinition";

export declare namespace TypeDefinition {
    export interface Props {
        typeShape: FernRegistry.TypeShape;
        isCollapsible: boolean;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
    }
}

export const TypeDefinition: React.FC<TypeDefinition.Props> = ({ typeShape, isCollapsible, onHoverProperty }) => {
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
            <InternalTypeDefinition typeShape={typeShape} isCollapsible={isCollapsible} />
        </TypeDefinitionContext.Provider>
    );
};
