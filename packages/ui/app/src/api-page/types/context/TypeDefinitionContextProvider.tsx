import { PropsWithChildren, useCallback } from "react";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinitionContext, TypeDefinitionContextValue } from "./TypeDefinitionContext";

export declare namespace TypeReferenceDefinitions {
    export type Props = PropsWithChildren<{
        onHoverProperty: ((path: JsonPropertyPath, opts: { isHovering: boolean }) => void) | undefined;
    }>;
}

export const TypeDefinitionContextProvider: React.FC<TypeReferenceDefinitions.Props> = ({
    onHoverProperty,
    children,
}) => {
    const contextValue = useCallback(
        (): TypeDefinitionContextValue => ({
            isRootTypeDefinition: true,
            jsonPropertyPath: [],
            onHoverProperty,
        }),
        [onHoverProperty]
    );

    return <TypeDefinitionContext.Provider value={contextValue}>{children}</TypeDefinitionContext.Provider>;
};
