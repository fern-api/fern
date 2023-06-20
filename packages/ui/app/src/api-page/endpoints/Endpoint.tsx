import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useEffect } from "react";
import { useDocsContext } from "../../docs-context/useDocsContext";
import { useApiPageContext } from "../api-page-context/useApiPageContext";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { EndpointContextProvider } from "./endpoint-context/EndpointContextProvider";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        slug: string;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ endpoint, slug }) => {
    const { isInVerticalCenter, setTargetRef } = useApiPageCenterElement({ slug });
    const { onScrollToPath } = useDocsContext();
    const { containerRef: apiPageContainerRef } = useApiPageContext();
    useEffect(() => {
        if (!isInVerticalCenter) {
            return;
        }

        const handler = () => {
            onScrollToPath(slug);
        };
        apiPageContainerRef?.addEventListener("scroll", handler, false);
        return () => {
            apiPageContainerRef?.removeEventListener("scroll", handler);
        };
    }, [apiPageContainerRef, isInVerticalCenter, onScrollToPath, slug]);

    return (
        <EndpointContextProvider>
            <EndpointContent endpoint={endpoint} setContainerRef={setTargetRef} />
        </EndpointContextProvider>
    );
};
