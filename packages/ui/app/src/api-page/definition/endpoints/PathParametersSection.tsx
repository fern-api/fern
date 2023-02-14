import { FernRegistry } from "@fern-fern/registry";
import { useMemo } from "react";
import { EndpointParameter } from "./EndpointParameter";
import { EndpointParametersSection } from "./EndpointParametersSection";

export declare namespace PathParametersSection {
    export interface Props {
        pathParameters: FernRegistry.PathParameter[];
    }
}

export const PathParametersSection: React.FC<PathParametersSection.Props> = ({ pathParameters }) => {
    const convertedParameters = useMemo((): EndpointParameter.Props[] => {
        return pathParameters.map((pathParameter) => ({
            name: pathParameter.key,
            type: pathParameter.type,
            docs: "I am a path param",
        }));
    }, [pathParameters]);

    return <EndpointParametersSection title="Path parameters" parameters={convertedParameters} />;
};
