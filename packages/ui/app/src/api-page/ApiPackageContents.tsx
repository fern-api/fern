import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { Endpoint } from "./endpoints/Endpoint";

export declare namespace ApiPackageContents {
    export interface Props {
        package: FernRegistryApiRead.ApiDefinitionPackage;
        slug: string;
    }
}

export const ApiPackageContents: React.FC<ApiPackageContents.Props> = ({ package: package_, slug }) => {
    const { resolveSubpackageById } = useApiDefinitionContext();

    return (
        <>
            {package_.endpoints.map((endpoint) => (
                <Endpoint key={endpoint.id} endpoint={endpoint} slug={joinUrlSlugs(slug, endpoint.urlSlug)} />
            ))}
            {package_.subpackages.map((subpackageId) => {
                const subpackage = resolveSubpackageById(subpackageId);
                return (
                    <ApiPackageContents
                        key={subpackageId}
                        package={subpackage}
                        slug={joinUrlSlugs(slug, subpackage.urlSlug)}
                    />
                );
            })}
        </>
    );
};
