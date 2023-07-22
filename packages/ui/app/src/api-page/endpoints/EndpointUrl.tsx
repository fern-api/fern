import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { useMemo } from "react";
import { divideEndpointPathToParts } from "../../util/endpoint";
import { getEndpointEnvironmentUrl } from "./getEndpointEnvironmentUrl";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        endpoint: FernRegistryApiRead.EndpointDefinition;
    }>;
}

export const EndpointUrl: React.FC<EndpointUrl.Props> = ({ endpoint }) => {
    const environmentUrl = useMemo(() => getEndpointEnvironmentUrl(endpoint), [endpoint]);
    const endpointPathParts = useMemo(() => divideEndpointPathToParts(endpoint), [endpoint]);

    return (
        <div className="flex items-center space-x-2 rounded">
            <div className="text-text-default flex items-center justify-center rounded bg-neutral-700/50 px-2 py-0.5 font-medium uppercase">
                {endpoint.method}
            </div>
            <div className="flex items-center space-x-1.5 py-1">
                <div className="text-text-default">{environmentUrl}</div>
                {endpointPathParts
                    .map((part) =>
                        visitDiscriminatedUnion(part, "type")._visit({
                            literal: (literal) => {
                                return <div className="text-text-default whitespace-nowrap">{literal.value}</div>;
                            },
                            pathParameter: (pathParameter) => (
                                <div className="bg-accentHighlight text-accentPrimary flex items-center justify-center whitespace-nowrap rounded px-1 py-0.5 font-mono">
                                    {pathParameter.name}
                                </div>
                            ),
                            _other: () => null,
                        })
                    )
                    .map((jsx) => (
                        <>
                            <div className="text-text-default">/</div>
                            {jsx}
                        </>
                    ))}
            </div>
        </div>
    );
};
