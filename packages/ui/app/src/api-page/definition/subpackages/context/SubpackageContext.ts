import { createContext, useContext } from "react";

export const SubpackageContext = createContext<() => SubpackageContextValue>(() => {
    throw new Error("SubpackageContextProvider not found in tree");
});

export interface SubpackageContextValue {
    setIsEndpointInView: (endpointId: string, isInView: boolean) => void;
}

export function useSubpackageContext(): SubpackageContextValue {
    return useContext(SubpackageContext)();
}
