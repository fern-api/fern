import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useDocsContext } from "../docs-context/useDocsContext";
import { ApiSubpackages } from "./ApiSubpackages";
import { joinUrlSlugs } from "./joinUrlSlugs";
import { SidebarGroup } from "./SidebarGroup";
import { SidebarItemLayout } from "./SidebarItemLayout";
import { TopLevelEndpointSidebarItem } from "./TopLevelEndpointSidebarItem";

export declare namespace ApiSidebarSection {
    export interface Props {
        apiSection: FernRegistryDocsRead.ApiSection;
        slug: string;
    }
}

export const ApiSidebarSection: React.FC<ApiSidebarSection.Props> = ({ slug, apiSection }) => {
    const { docsDefinition } = useDocsContext();

    const api = docsDefinition.apis[apiSection.api];
    if (api == null) {
        throw new Error("API does not exist: " + apiSection.api);
    }

    return (
        <SidebarGroup title={<SidebarItemLayout title={apiSection.title} />}>
            {api.rootPackage.endpoints.map((endpoint) => (
                <TopLevelEndpointSidebarItem
                    key={endpoint.id}
                    slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                    endpoint={endpoint}
                />
            ))}
            <ApiSubpackages apiId={apiSection.api} package={api.rootPackage} slug={slug} />
        </SidebarGroup>
    );
};
