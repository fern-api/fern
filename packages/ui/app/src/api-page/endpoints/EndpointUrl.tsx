import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import { useMemo } from "react";
import { divideEndpointPathToParts } from "../../util/endpoint";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        endpoint: FernRegistryApiRead.EndpointDefinition;
        className?: string;
    }>;
}

export const EndpointUrl: React.FC<EndpointUrl.Props> = ({ endpoint, className }) => {
    const endpointPathParts = useMemo(() => divideEndpointPathToParts(endpoint), [endpoint]);

    return (
        <div
            className={classNames(
                "border-border-concealed flex h-9 overflow-x-hidden items-center space-x-3 rounded-lg border bg-neutral-700/20 px-3 py-0.5",
                className
            )}
        >
            <div className="text-text-default flex items-center justify-center font-medium uppercase">
                {endpoint.method}
            </div>
            <div className="flex items-center space-x-1 py-1">
                {endpointPathParts
                    .map((part) =>
                        visitDiscriminatedUnion(part, "type")._visit({
                            literal: (literal) => {
                                return (
                                    <div className="text-text-default whitespace-nowrap font-light">
                                        {literal.value}
                                    </div>
                                );
                            },
                            pathParameter: (pathParameter) => (
                                <div className="bg-accentHighlight text-accentPrimary flex items-center justify-center whitespace-nowrap rounded px-1 py-0.5 font-mono text-xs">
                                    :{pathParameter.name}
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
