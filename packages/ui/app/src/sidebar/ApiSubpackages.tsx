import { FernRegistry } from "@fern-fern/registry-browser";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { ApiSubpackageSidebarSection } from "./ApiSubpackageSidebarSection";
import { joinUrlSlugs } from "./joinUrlSlugs";

export declare namespace ApiSubpackages {
    export interface Props {
        apiId: FernRegistry.ApiDefinitionId;
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
    }
}

export const ApiSubpackages: React.FC<ApiSubpackages.Props> = ({ apiId, slug, package: package_ }) => {
    const { resolveSubpackageById } = useApiDefinitionContext();

    return (
        <>
            {package_.subpackages.map((subpackageId) => {
                const subpackage = resolveSubpackageById(subpackageId);
                return (
                    <ApiSubpackageSidebarSection
                        key={subpackageId}
                        apiId={apiId}
                        subpackage={subpackage}
                        slug={joinUrlSlugs(slug, subpackage.urlSlug)}
                    />
                );
            })}
        </>
    );
};
