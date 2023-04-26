import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { ResolvedSubpackagePath } from "../../api-context/url-path-resolver/UrlPathResolver";
import { Endpoint } from "../endpoints/Endpoint";

export declare namespace SubpackageEndpoint {
    export interface Props {
        subpackageId: FernRegistry.SubpackageId;
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const SubpackageEndpoint: React.FC<SubpackageEndpoint.Props> = ({ subpackageId, endpoint }) => {
    const resolvedUrlPath = useMemo(
        (): ResolvedSubpackagePath => ({
            type: "subpackage",
            subpackageId,
            endpointId: endpoint.id,
        }),
        [endpoint.id, subpackageId]
    );

    return <Endpoint resolvedUrlPath={resolvedUrlPath} endpoint={endpoint} />;
};
