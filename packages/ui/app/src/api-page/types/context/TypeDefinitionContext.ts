import { createContext, useContext } from "react";
import { JsonPropertyPath } from "../../examples/json-example/contexts/JsonPropertyPath";

export const TypeDefinitionContext = createContext<() => TypeDefinitionContextValue>(() => {
    throw new Error("TypeDefinitionContext.Provider not found in tree");
});

export interface TypeDefinitionContextValue {
    isRootTypeDefinition: boolean;
    jsonPropertyPath: JsonPropertyPath;
    onHoverProperty: ((path: JsonPropertyPath, opts: { isHovering: boolean }) => void) | undefined;
}

export function useTypeDefinitionContext(): TypeDefinitionContextValue {
    return useContext(TypeDefinitionContext)();
}
