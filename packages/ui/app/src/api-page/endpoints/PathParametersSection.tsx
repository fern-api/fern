import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointParametersSection } from "./EndpointParametersSection";

export declare namespace PathParametersSection {
    export interface Props {
        pathParameters: FernRegistryApiRead.PathParameter[];
        getParameterAnchor?: (param: FernRegistryApiRead.PathParameter) => string;
    }
}

export const PathParametersSection: React.FC<PathParametersSection.Props> = ({
    pathParameters,
    getParameterAnchor,
}) => {
    const convertedParameters = useMemo((): EndpointParameter.Props[] => {
        return pathParameters.map(
            (pathParameter): EndpointParameter.Props => ({
                name: pathParameter.key,
                type: pathParameter.type,
                description: pathParameter.description ?? undefined,
                anchor: getParameterAnchor?.(pathParameter),
            })
        );
    }, [pathParameters, getParameterAnchor]);

    return <EndpointParametersSection title="Path parameters" parameters={convertedParameters} />;
};
