import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useState } from "react";
import { useApiDefinitionContext } from "../../../api-context/useApiDefinitionContext";
import { SeparatedElements } from "../../../commons/SeparatedElements";
import { Endpoint } from "../endpoints/Endpoint";
import { useSubpackageScrolling } from "./useSubpackageScrolling";

export declare namespace ApiSubpackage {
    export interface Props {
        subpackageId: FernRegistryApiRead.SubpackageId;
    }
}

export const ApiSubpackage: React.FC<ApiSubpackage.Props> = ({ subpackageId }) => {
    const { resolveSubpackageById } = useApiDefinitionContext();
    const subpackage = resolveSubpackageById(subpackageId);

    const [ref, setRef] = useState<HTMLDivElement | null>(null);
    const { setIsEndpointInVerticalCenter, setIsEndpointInView } = useSubpackageScrolling({
        containerRef: ref ?? undefined,
    });

    return (
        <div className="min-h-0 overflow-y-auto" ref={setRef}>
            <SeparatedElements
                separator={
                    <div className="h-72 flex items-center">
                        <div className="flex-1 h-px bg-neutral-700" />
                    </div>
                }
            >
                {subpackage.endpoints.map((endpoint) => (
                    <div key={endpoint.id} className="flex-1 flex min-w-0">
                        <Endpoint
                            endpoint={endpoint}
                            setIsInView={setIsEndpointInView}
                            setIsIntersectingVerticalCenter={setIsEndpointInVerticalCenter}
                        />
                    </div>
                ))}
            </SeparatedElements>
        </div>
    );
};
