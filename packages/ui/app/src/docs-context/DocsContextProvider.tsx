import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { PropsWithChildren, useCallback } from "react";
import { DocsContext, DocsContextValue } from "./DocsContext";

export declare namespace DocsContextProvider {
    export type Props = PropsWithChildren<{
        docsDefinition: FernRegistryDocsRead.DocsDefinition;
    }>;
}

export const DocsContextProvider: React.FC<DocsContextProvider.Props> = ({ docsDefinition, children }) => {
    const contextValue = useCallback(
        (): DocsContextValue => ({
            docsDefinition,
        }),
        [docsDefinition]
    );

    return <DocsContext.Provider value={contextValue}>{children}</DocsContext.Provider>;
};
