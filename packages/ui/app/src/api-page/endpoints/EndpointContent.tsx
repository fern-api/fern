import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { useDocsContext } from "../../docs-context/useDocsContext";
import { PageMargins } from "../../page/PageMargins";
import { useApiPageContext } from "../api-page-context/useApiPageContext";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { Markdown } from "../markdown/Markdown";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { useEndpointContext } from "./endpoint-context/useEndpointContext";
import { EndpointExamples } from "./endpoint-examples/EndpointExamples";
import { EndpointMethodPill } from "./EndpointMethodPill";
import { EndpointPathParameter } from "./EndpointPathParameter";
import { EndpointRequestSection } from "./EndpointRequestSection";
import { EndpointResponseSection } from "./EndpointResponseSection";
import { EndpointSection } from "./EndpointSection";
import { EndpointTitle } from "./EndpointTitle";
import { PathParametersSection } from "./PathParametersSection";
import { QueryParametersSection } from "./QueryParametersSection";
import { useEndpointEnvironmentUrl } from "./useEndpointEnvironmentUrl";

export declare namespace EndpointContent {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        slug: string;
    }
}

export const EndpointContent: React.FC<EndpointContent.Props> = ({ endpoint, slug }) => {
    const isInitialMount = useRef(true);
    useLayoutEffect(() => {
        isInitialMount.current = false;
    }, []);

    const { setHoveredRequestPropertyPath, setHoveredResponsePropertyPath } = useEndpointContext();
    const onHoverRequestProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredRequestPropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredRequestPropertyPath]
    );
    const onHoverResponseProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredResponsePropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredResponsePropertyPath]
    );

    const { isInVerticalCenter, setTargetRef } = useApiPageCenterElement({ slug });
    const { onScrollToPath } = useDocsContext();
    const { containerRef: apiPageContainerRef } = useApiPageContext();
    useEffect(() => {
        if (!isInVerticalCenter) {
            return;
        }

        const handler = () => {
            onScrollToPath(slug);
        };
        apiPageContainerRef?.addEventListener("scroll", handler, false);
        return () => {
            apiPageContainerRef?.removeEventListener("scroll", handler);
        };
    }, [apiPageContainerRef, isInVerticalCenter, onScrollToPath, slug]);

    const [titleHeight, setTitleHeight] = useState<number>();
    const setTitleRef = useCallback(
        (ref: HTMLElement | null) => {
            if (titleHeight == null && ref != null) {
                setTitleHeight(ref.getBoundingClientRect().height);
            }
        },
        [titleHeight]
    );

    const environmentUrl = useEndpointEnvironmentUrl(endpoint);

    return (
        <PageMargins>
            <div className="flex min-w-0 flex-1 gap-20" ref={setTargetRef}>
                <div className="flex flex-1 flex-col pb-20">
                    <div className="pb-8 pt-20 text-3xl font-medium" ref={setTitleRef}>
                        <EndpointTitle endpoint={endpoint} />
                    </div>
                    <div className="flex items-center gap-2">
                        <EndpointMethodPill endpoint={endpoint} />
                        <MonospaceText className="text-text-muted flex">
                            {environmentUrl}
                            {endpoint.path.parts.map((part, index) => (
                                <React.Fragment key={index}>
                                    {part._visit<JSX.Element | string | null>({
                                        literal: (literal) => literal,
                                        pathParameter: (pathParameter) => (
                                            <EndpointPathParameter pathParameter={pathParameter} />
                                        ),
                                        _other: () => null,
                                    })}
                                </React.Fragment>
                            ))}
                        </MonospaceText>
                    </div>
                    {endpoint.description != null && (
                        <div className="mt-6">
                            <Markdown>{endpoint.description}</Markdown>
                        </div>
                    )}
                    <div className="mt-8 flex">
                        <div className="flex flex-1 flex-col gap-12">
                            {endpoint.path.pathParameters.length > 0 && (
                                <PathParametersSection pathParameters={endpoint.path.pathParameters} />
                            )}
                            {endpoint.queryParameters.length > 0 && (
                                <QueryParametersSection queryParameters={endpoint.queryParameters} />
                            )}
                            {endpoint.request != null && (
                                <EndpointSection title="Request">
                                    <EndpointRequestSection
                                        httpRequest={endpoint.request}
                                        onHoverProperty={onHoverRequestProperty}
                                    />
                                </EndpointSection>
                            )}
                            {endpoint.response != null && (
                                <EndpointSection title="Response">
                                    <EndpointResponseSection
                                        httpResponse={endpoint.response}
                                        onHoverProperty={onHoverResponseProperty}
                                    />
                                </EndpointSection>
                            )}
                        </div>
                    </div>
                </div>
                {titleHeight != null && (
                    <div
                        className={classNames(
                            "flex-1 flex sticky self-start top-0 min-w-0",
                            // the py-10 is the same as the 40px below
                            "py-10",
                            // the 4rem is the same as the h-10 as the Header
                            "max-h-[calc(100vh-4rem)]"
                        )}
                        style={{
                            // the 40px is the same as the py-10 above
                            marginTop: titleHeight - 40,
                        }}
                    >
                        <EndpointExamples endpoint={endpoint} />
                    </div>
                )}
            </div>
        </PageMargins>
    );
};
