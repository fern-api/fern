import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { EndpointTitle } from "../api-page/endpoints/EndpointTitle";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";

export declare namespace EndpointSidebarItem {
    export interface Props {
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const EndpointSidebarItem: React.FC<EndpointSidebarItem.Props> = ({ slug, endpoint }) => {
    const { apiSection, apiSlug } = useApiDefinitionContext();

    const path = useMemo(
        (): ResolvedUrlPath.Endpoint => ({
            type: "endpoint",
            api: apiSection,
            apiSlug,
            slug,
            endpoint,
        }),
        [apiSection, apiSlug, endpoint, slug]
    );

    return <NavigatingSidebarItem path={path} title={<EndpointTitle endpoint={endpoint} />} />;
};
