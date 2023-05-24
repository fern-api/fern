import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ApiSubpackageSidebarSection } from "./ApiSubpackageSidebarSection";

export declare namespace ApiSubpackages {
    export interface Props {
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
    }
}

export const ApiSubpackages: React.FC<ApiSubpackages.Props> = ({ slug, package: package_ }) => {
    const { resolveSubpackageById } = useApiDefinitionContext();

    return (
        <>
            {package_.subpackages.map((subpackageId) => {
                const subpackage = resolveSubpackageById(subpackageId);
                return (
                    <ApiSubpackageSidebarSection
                        key={subpackageId}
                        subpackage={subpackage}
                        slug={joinUrlSlugs(slug, subpackage.urlSlug)}
                    />
                );
            })}
        </>
    );
};
