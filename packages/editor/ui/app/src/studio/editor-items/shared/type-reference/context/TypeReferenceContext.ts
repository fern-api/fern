import { createContext } from "react";

export const TypeReferenceContext = createContext<TypeReferenceContextValue>({
    isSelected: false,
    isHovering: false,
    isMouseDown: false,
    isDefaultContext: true,
});

export interface TypeReferenceContextValue {
    isSelected: boolean;
    isHovering: boolean;
    isMouseDown: boolean;
    isDefaultContext: boolean;
}
