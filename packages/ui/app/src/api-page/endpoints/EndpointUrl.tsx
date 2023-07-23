import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import type * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import React, { useCallback, useMemo } from "react";
import { divideEndpointPathToParts, type EndpointPathPart } from "../../util/endpoint";
import styles from "./EndpointUrl.module.scss";

export declare namespace EndpointUrl {
    export type Props = React.PropsWithChildren<{
        endpoint: FernRegistryApiRead.EndpointDefinition;
        className?: string;
    }>;
}

export const EndpointUrl: React.FC<EndpointUrl.Props> = ({ endpoint, className }) => {
    const endpointPathParts = useMemo(() => divideEndpointPathToParts(endpoint), [endpoint]);

    const renderPathParts = useCallback((parts: EndpointPathPart[]) => {
        return parts
            .map((part) =>
                visitDiscriminatedUnion(part, "type")._visit({
                    literal: (literal) => {
                        return <div className="text-text-default whitespace-nowrap font-light">{literal.value}</div>;
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
            ));
    }, []);

    return (
        <div
            className={classNames(
                "border-border-concealed flex h-9 overflow-x-hidden items-center rounded-lg border bg-neutral-700/20 px-3 py-0.5",
                className
            )}
        >
            <div className="text-text-default flex shrink-0 items-center justify-center font-medium uppercase">
                {endpoint.method}
            </div>
            <div
                className={classNames(
                    styles.urlContainer,
                    "ml-3 flex shrink grow items-center space-x-1 overflow-x-hidden"
                )}
            >
                {renderPathParts(endpointPathParts)}
            </div>
        </div>
    );
};
