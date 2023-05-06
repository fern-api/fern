import { FernRegistry } from "@fern-fern/registry";
import { useState } from "react";
import { SubpackageEndpoint } from "./SubpackageEndpoint";
import { useSubpackageScrolling } from "./useSubpackageScrolling";

export declare namespace Subpackage {
    export interface Props {
        subpackageId: FernRegistry.SubpackageId;
        subpackage: FernRegistry.ApiDefinitionSubpackage;
    }
}

export const Subpackage: React.FC<Subpackage.Props> = ({ subpackageId, subpackage }) => {
    const [ref, setRef] = useState<HTMLDivElement | null>(null);

    const { setIsEndpointInView } = useSubpackageScrolling({
        containerRef: ref ?? undefined,
        subpackageId,
    });

    return (
        <div className="min-h-0 overflow-y-auto" ref={setRef}>
            {subpackage.endpoints.map((endpoint) => (
                <div key={endpoint.id} className="flex-1 flex pb-36 min-w-0">
                    <SubpackageEndpoint
                        subpackageId={subpackageId}
                        endpoint={endpoint}
                        setIsInView={setIsEndpointInView}
                    />
                </div>
            ))}
        </div>
    );
};
