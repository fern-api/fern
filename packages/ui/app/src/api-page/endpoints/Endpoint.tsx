import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { ResolvedUrlPath } from "../../docs-context/url-path-resolver/UrlPathResolver";
import { EndpointContextProvider } from "./endpoint-context/EndpointContextProvider";
import { EndpointContent } from "./EndpointContent";

export declare namespace Endpoint {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        slug: string;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ endpoint, slug }) => {
    const { apiSection, apiSlug } = useApiDefinitionContext();
    const path = useMemo(
        (): ResolvedUrlPath.Endpoint => ({
            type: "endpoint",
            apiSection,
            apiSlug,
            slug,
            endpoint,
        }),
        [apiSection, apiSlug, endpoint, slug]
    );

    return (
        <EndpointContextProvider>
            <EndpointContent path={path} endpoint={endpoint} />
        </EndpointContextProvider>
    );
};
