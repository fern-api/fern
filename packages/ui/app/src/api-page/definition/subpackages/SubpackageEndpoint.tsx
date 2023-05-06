import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { ResolvedSubpackagePath } from "../../api-context/url-path-resolver/UrlPathResolver";
import { Endpoint } from "../endpoints/Endpoint";

export declare namespace SubpackageEndpoint {
    export interface Props extends Omit<Endpoint.Props, "resolvedUrlPath"> {
        subpackageId: FernRegistry.SubpackageId;
    }
}

export const SubpackageEndpoint: React.FC<SubpackageEndpoint.Props> = ({ subpackageId, ...endpointProps }) => {
    const resolvedUrlPath = useMemo(
        (): ResolvedSubpackagePath => ({
            type: "subpackage",
            subpackageId,
            endpointId: endpointProps.endpoint.id,
        }),
        [endpointProps.endpoint.id, subpackageId]
    );

    return <Endpoint resolvedUrlPath={resolvedUrlPath} {...endpointProps} />;
};
