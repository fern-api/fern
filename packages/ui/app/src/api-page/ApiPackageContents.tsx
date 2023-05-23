import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { ResolvedUrlPath } from "../docs-context/url-path-resolver/UrlPathResolver";
import { Endpoint } from "./endpoints/Endpoint";
import { ApiSubpackage } from "./subpackages/ApiSubpackage";

export declare namespace ApiPackageContents {
    export interface Props {
        path: ResolvedUrlPath.Api | ResolvedUrlPath.ApiSubpackage;
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
                    <ApiSubpackage
                        key={subpackageId}
                        subpackageId={subpackageId}
                        slug={joinUrlSlugs(slug, subpackage.urlSlug)}
                    />
                );
            })}
        </>
    );
};
