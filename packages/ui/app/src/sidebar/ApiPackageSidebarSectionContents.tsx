import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSubpackages } from "./ApiSubpackages";
import { EndpointSidebarItem } from "./EndpointSidebarItem";

export declare namespace ApiPackageSidebarSectionContents {
    export interface Props {
        package: FernRegistryApiRead.ApiDefinitionPackage.Raw;
        slug: string;
    }
}

export const ApiPackageSidebarSectionContents: React.FC<ApiPackageSidebarSectionContents.Props> = ({
    package: package_,
    slug,
}) => {
    return (
        <div className="flex flex-col">
            {package_.endpoints.map((endpoint, endpointIndex) => (
                <EndpointSidebarItem
                    key={endpointIndex}
                    endpoint={endpoint}
                    slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                />
            ))}
            <ApiSubpackages package={package_} slug={slug} />
        </div>
    );
};
