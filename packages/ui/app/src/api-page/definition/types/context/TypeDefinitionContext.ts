import { createContext } from "react";

export const TypeDefinitionContext = createContext<TypeDefinitionContextValue>({
    isRootTypeDefinition: true,
});

export interface TypeDefinitionContextValue {
    isRootTypeDefinition: boolean;
}
