import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { SeparatedElements } from "../../commons/SeparatedElements";
import { joinUrlSlugs } from "../../docs-context/joinUrlSlugs";
import { Endpoint } from "../endpoints/Endpoint";

export declare namespace ApiSubpackage {
    export interface Props {
        subpackageId: FernRegistryApiRead.SubpackageId;
        slug: string;
    }
}

export const ApiSubpackage: React.FC<ApiSubpackage.Props> = ({ subpackageId, slug }) => {
    const { resolveSubpackageById } = useApiDefinitionContext();
    const subpackage = resolveSubpackageById(subpackageId);

    return (
        <div className="min-h-0 overflow-y-auto pb-36">
            <SeparatedElements
                separator={
                    <div className="h-72 flex items-center">
                        <div className="flex-1 h-px bg-neutral-700" />
                    </div>
                }
            >
                {subpackage.endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="flex-1 flex min-w-0">
                        <Endpoint endpoint={endpoint} slug={joinUrlSlugs(slug, endpoint.urlSlug)} />
                    </div>
                ))}
            </SeparatedElements>
        </div>
    );
};
