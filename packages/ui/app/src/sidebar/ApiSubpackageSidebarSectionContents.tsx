import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSubpackages } from "./ApiSubpackages";
import { EndpointSidebarItem } from "./EndpointSidebarItem";

export declare namespace ApiSubpackageSidebarSectionContents {
    export interface Props {
        api: FernRegistryDocsRead.ApiSection;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
        slug: string;
    }
}

export const ApiSubpackageSidebarSectionContents: React.FC<ApiSubpackageSidebarSectionContents.Props> = ({
    api,
    subpackage,
    slug,
}) => {
    return (
        <div className="flex flex-col">
            {subpackage.endpoints.map((endpoint, endpointIndex) => (
                <EndpointSidebarItem
                    key={endpointIndex}
                    endpoint={endpoint}
                    api={api}
                    slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                />
            ))}
            <ApiSubpackages api={api} package={subpackage} slug={slug} />
        </div>
    );
};
