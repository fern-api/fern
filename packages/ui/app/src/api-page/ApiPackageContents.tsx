import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiDefinitionContext } from "../api-context/useApiDefinitionContext";
import { SeparatedElements } from "../commons/SeparatedElements";
import { joinUrlSlugs } from "../docs-context/joinUrlSlugs";
import { Endpoint } from "./endpoints/Endpoint";
import { SectionSeparator } from "./section-separator/SectionSeparator";
import { ApiSubpackage } from "./subpackages/ApiSubpackage";
import { doesSubpackageHaveEndpointsRecursive } from "./subpackages/doesSubpackageHaveEndpointsRecursive";

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
            <SeparatedElements separator={<SectionSeparator />}>
                {[
                    ...package_.endpoints.map((endpoint) => (
                        <Endpoint
                            key={endpoint.id}
                            endpoint={endpoint}
                            slug={joinUrlSlugs(slug, endpoint.urlSlug)}
                            package={package_}
                        />
                    )),
                    ...package_.subpackages.map((subpackageId) => {
                        if (!doesSubpackageHaveEndpointsRecursive(subpackageId, resolveSubpackageById)) {
                            return null;
                        }
                        const subpackage = resolveSubpackageById(subpackageId);
                        return (
                            <ApiSubpackage
                                key={subpackageId}
                                subpackageId={subpackageId}
                                slug={joinUrlSlugs(slug, subpackage.urlSlug)}
                            />
                        );
                    }),
                ]}
            </SeparatedElements>
        </>
    );
};
