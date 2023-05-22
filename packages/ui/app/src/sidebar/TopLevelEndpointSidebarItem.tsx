import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useMemo } from "react";
import { EndpointTitle } from "../api-components/endpoints/EndpointTitle";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { NavigatingSidebarItem } from "./NavigatingSidebarItem";

export declare namespace TopLevelEndpointSidebarItem {
    export interface Props {
        slug: string;
        api: FernRegistryDocsRead.ApiSection;
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }
}

export const TopLevelEndpointSidebarItem: React.FC<TopLevelEndpointSidebarItem.Props> = ({ slug, api, endpoint }) => {
    const path = useMemo(
        (): ResolvedUrlPath.TopLevelEndpoint => ({
            type: "topLevelEndpoint",
            api,
            slug,
            endpoint,
        }),
        [api, endpoint, slug]
    );

    return <NavigatingSidebarItem path={path} title={<EndpointTitle endpoint={endpoint} />} />;
};
