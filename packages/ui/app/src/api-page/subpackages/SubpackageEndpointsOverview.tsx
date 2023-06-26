import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useCallback } from "react";
import { joinUrlSlugs } from "../../docs-context/joinUrlSlugs";
import { useDocsContext } from "../../docs-context/useDocsContext";
import { EndpointDescriptor } from "./EndpointDescriptor";

export declare namespace SubpackageEndpointsOverview {
    export interface Props {
        slug: string;
        subpackage: FernRegistryApiRead.ApiDefinitionSubpackage;
    }
}

export const SubpackageEndpointsOverview: React.FC<SubpackageEndpointsOverview.Props> = ({ slug, subpackage }) => {
    const { navigateToPath } = useDocsContext();

    const handleEndpointClick = useCallback(
        (endpointDef: FernRegistryApiRead.EndpointDefinition) => {
            const endpointSlug = joinUrlSlugs(slug, endpointDef.urlSlug);
            navigateToPath(endpointSlug);
        },
        [navigateToPath, slug]
    );

    return (
        <div className="border-border flex flex-col overflow-hidden rounded-xl border">
            <div className="border-border flex h-10 items-center justify-between border-b bg-white/10 px-3 py-1">
                <div className="text-xs uppercase tracking-wide text-neutral-300">Endpoints</div>
            </div>
            <div className="space-y-1.5 p-3">
                {subpackage.endpoints.map((e) => (
                    <EndpointDescriptor key={e.id} endpointDefinition={e} onClick={() => handleEndpointClick(e)} />
                ))}
            </div>
        </div>
    );
};
