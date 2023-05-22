import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSubpackageSidebarSection } from "./ApiSubpackageSidebarSection";

export declare namespace ApiSubpackages {
    export interface Props {
        api: FernRegistryDocsRead.ApiSection;
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
    }
}

export const ApiSubpackages: React.FC<ApiSubpackages.Props> = ({ api, slug, package: package_ }) => {
    const { resolveSubpackageById } = useApiDefinitionContext();

    return (
        <>
            {package_.subpackages.map((subpackageId) => {
                const subpackage = resolveSubpackageById(subpackageId);
                return (
                    <ApiSubpackageSidebarSection
                        key={subpackageId}
                        api={api}
                        subpackage={subpackage}
                        slug={joinUrlSlugs(slug, subpackage.urlSlug)}
                    />
                );
            })}
        </>
    );
};
