import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { EndpointTitle } from "../api-page/endpoints/EndpointTitle";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";

export declare namespace TopLevelEndpointSidebarItem {
    export interface Props {
        slug: string;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const TopLevelEndpointSidebarItem: React.FC<TopLevelEndpointSidebarItem.Props> = ({ slug, endpoint }) => {
    const { apiSection, apiSlug } = useApiDefinitionContext();

    const path = useMemo(
        (): ResolvedUrlPath.TopLevelEndpoint => ({
            type: "topLevelEndpoint",
            api: apiSection,
            apiSlug,
            slug,
            endpoint,
        }),
        [apiSection, apiSlug, endpoint, slug]
    );

    return <NavigatingSidebarItem path={path} title={<EndpointTitle endpoint={endpoint} />} />;
};
