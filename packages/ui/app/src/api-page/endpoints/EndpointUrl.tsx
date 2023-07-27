import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import React, { PropsWithChildren, useCallback, useMemo } from "react";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { divideEndpointPathToParts, type EndpointPathPart } from "../../util/endpoint";
import styles from "./EndpointUrl.module.scss";
import { getEndpointEnvironmentUrl } from "./getEndpointEnvironmentUrl";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        urlStyle: "default" | "overflow";
        endpoint: FernRegistryApiRead.EndpointDefinition;
        className?: string;
    }>;
}

export const EndpointUrl = React.forwardRef<HTMLDivElement, PropsWithChildren<EndpointUrl.Props>>(function EndpointUrl(
    { endpoint, className, urlStyle },
    ref
) {
    const { apiDefinition } = useApiDefinitionContext();
    const endpointPathParts = useMemo(() => divideEndpointPathToParts(endpoint), [endpoint]);

    const renderPathParts = useCallback(
        (parts: EndpointPathPart[]) => {
            const elements: (JSX.Element | null)[] = [];
            if (apiDefinition.hasMultipleBaseUrls === true) {
                const url = getEndpointEnvironmentUrl(endpoint);
                if (url != null) {
                    elements.push(
                        <div key="base-url" className="text-text-default whitespace-nowrap font-light">
                            {url}
                        </div>
                    );
                }
            }
            parts.forEach((p, i) => {
                elements.push(
                    <div key={`separator-${i}`} className="text-text-default">
                        /
                    </div>,
                    visitDiscriminatedUnion(p, "type")._visit({
                        literal: (literal) => {
                            return (
                                <div key={`part-${i}`} className="text-text-default whitespace-nowrap font-light">
                                    {literal.value}
                                </div>
                            );
                        },
                        pathParameter: (pathParameter) => (
                            <div
                                key={`part-${i}`}
                                className="bg-accentHighlight text-accentPrimary flex items-center justify-center whitespace-nowrap rounded px-1 py-0.5 font-mono text-xs"
                            >
                                :{pathParameter.name}
                            </div>
                        ),
                        _other: () => null,
                    })
                );
            });
            return elements;
        },
        [apiDefinition.hasMultipleBaseUrls, endpoint]
    );

    return (
        <div
            ref={ref}
            className={classNames(
                "border-border-concealed flex h-9 overflow-x-hidden items-center rounded-lg border bg-neutral-700/20 px-3 py-0.5",
                className
            )}
        >
            <div className="text-text-default flex shrink-0 items-center justify-center font-medium uppercase">
                {endpoint.method}
            </div>
            <div
                className={classNames("ml-3 flex shrink grow items-center space-x-1 overflow-x-hidden", {
                    [styles.urlOverflowContainer ?? ""]: urlStyle === "overflow",
                })}
            >
                {renderPathParts(endpointPathParts)}
            </div>
        </div>
    );
});
