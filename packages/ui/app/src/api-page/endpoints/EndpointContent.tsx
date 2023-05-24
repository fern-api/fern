import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import React, { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { ResolvedUrlPath } from "../../docs-context/url-path-resolver/UrlPathResolver";
import { useDocsContext } from "../../docs-context/useDocsContext";
import { PageMargins } from "../../page-margins/PageMargins";
import { useApiPageContext } from "../api-page-context/useApiPageContext";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { Markdown } from "../markdown/Markdown";
import { useApiPageCenterElement } from "../useApiPageCenterElement";
import { useEndpointContext } from "./endpoint-context/useEndpointContext";
import { EndpointExamples } from "./endpoint-examples/EndpointExamples";
import { EndpointPathParameter } from "./EndpointPathParameter";
import { EndpointSection } from "./EndpointSection";
import { EndpointTitle } from "./EndpointTitle";
import { EndpointTypeSection } from "./EndpointTypeSection";
import { PathParametersSection } from "./PathParametersSection";
import { QueryParametersSection } from "./QueryParametersSection";

export declare namespace EndpointContent {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        path: ResolvedUrlPath.Endpoint | ResolvedUrlPath.TopLevelEndpoint;
    }
}

export const EndpointContent: React.FC<EndpointContent.Props> = ({ endpoint, path }) => {
    const isInitialMount = useRef(true);
    useLayoutEffect(() => {
        isInitialMount.current = false;
    }, []);

    const { setHoveredResponsePropertyPath } = useEndpointContext();
    const onHoverResponseProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredResponsePropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredResponsePropertyPath]
    );

    const { isInVerticalCenter, setTargetRef } = useApiPageCenterElement({ path });
    const { setSelectedPath } = useDocsContext();
    const { containerRef: apiPageContainerRef } = useApiPageContext();
    useEffect(() => {
        if (!isInVerticalCenter) {
            return;
        }

        const handler = () => {
            setSelectedPath(path);
        };
        apiPageContainerRef?.addEventListener("scroll", handler, false);
        return () => {
            apiPageContainerRef?.removeEventListener("scroll", handler);
        };
    }, [apiPageContainerRef, isInVerticalCenter, path, setSelectedPath]);

    return (
        <div className="flex flex-col">
            <PageMargins>
                <div className="flex-1 flex gap-24 min-w-0" ref={setTargetRef}>
                    <div className="flex-1 flex flex-col">
                        <div className="pt-10 text-2xl font-bold">
                            <EndpointTitle endpoint={endpoint} />
                        </div>
                        <div className="mt-6">
                            <div className="flex items-center gap-2 text-gray-500">
                                <div className="font-bold text-base">GET</div>
                                <div className="flex">
                                    {endpoint.path.parts.map((part, index) => (
                                        <MonospaceText key={index}>
                                            {part._visit<JSX.Element | string | null>({
                                                literal: (literal) => literal,
                                                pathParameter: (pathParameter) => (
                                                    <EndpointPathParameter pathParameter={pathParameter} />
                                                ),
                                                _other: () => null,
                                            })}
                                        </MonospaceText>
                                    ))}
                                </div>
                            </div>
                        </div>
                        {endpoint.description != null && (
                            <div className="mt-6">
                                <Markdown>{endpoint.description}</Markdown>
                            </div>
                        )}
                        <div className="flex mt-8">
                            <div className="flex flex-1 flex-col gap-12">
                                {endpoint.path.pathParameters.length > 0 && (
                                    <PathParametersSection pathParameters={endpoint.path.pathParameters} />
                                )}
                                {endpoint.queryParameters.length > 0 && (
                                    <QueryParametersSection queryParameters={endpoint.queryParameters} />
                                )}
                                {endpoint.request != null && (
                                    <EndpointSection title="Request">
                                        <EndpointTypeSection httpBody={endpoint.request} verb="expects" />
                                    </EndpointSection>
                                )}
                                {endpoint.response != null && (
                                    <EndpointSection title="Response">
                                        <EndpointTypeSection
                                            httpBody={endpoint.response}
                                            onHoverProperty={onHoverResponseProperty}
                                            verb="returns"
                                        />
                                    </EndpointSection>
                                )}
                            </div>
                        </div>
                    </div>
                    <div
                        className={classNames(
                            "flex-1 flex sticky self-start top-0 min-w-0",
                            // the 4rem is the same as the h-10 as the Header
                            "max-h-[calc(100vh-4rem)]"
                        )}
                    >
                        <EndpointExamples endpoint={endpoint} />
                    </div>
                </div>
            </PageMargins>
            <div className="h-72 flex items-center">
                <div className="flex-1 h-px bg-neutral-700" />
            </div>
        </div>
    );
};
