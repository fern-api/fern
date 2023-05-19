import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useCallback, useMemo } from "react";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointParametersSection } from "./EndpointParametersSection";
import { EndpointPathParameter } from "./EndpointPathParameter";

export declare namespace PathParametersSection {
    export interface Props {
        pathParameters: FernRegistryApiRead.PathParameter[];
    }
}

export const PathParametersSection: React.FC<PathParametersSection.Props> = ({ pathParameters }) => {
    const convertedParameters = useMemo((): EndpointParameter.Props[] => {
        return pathParameters.map((pathParameter) => ({
            name: pathParameter.key,
            type: pathParameter.type,
            description: pathParameter.description,
        }));
    }, [pathParameters]);

    const renderName = useCallback((name: string) => <EndpointPathParameter pathParameter={name} />, []);

    return (
        <EndpointParametersSection title="Path parameters" parameters={convertedParameters} renderName={renderName} />
    );
};
