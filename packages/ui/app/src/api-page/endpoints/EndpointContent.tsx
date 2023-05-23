import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { ResolvedUrlPath } from "../../docs-context/url-path-resolver/UrlPathResolver";
import { useDocsContext } from "../../docs-context/useDocsContext";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { Markdown } from "../markdown/Markdown";
import { useEndpointContext } from "./context/useEndpointContext";
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
        setIsInView?: (endpoint: FernRegistryApiRead.EndpointDefinition, isInView: boolean) => void;
        setIsIntersectingVerticalCenter?: (
            endpoint: FernRegistryApiRead.EndpointDefinition,
            isInVerticalCenter: boolean
        ) => void;
    }
}

export const EndpointContent: React.FC<EndpointContent.Props> = ({ endpoint, path, setIsInView }) => {
    const { registerNavigateToPathListener, setPathInView } = useDocsContext();

    const { setHoveredResponsePropertyPath } = useEndpointContext();
    const onHoverResponseProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredResponsePropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredResponsePropertyPath]
    );

    const onChangeIsInView = useMemo(() => {
        if (setIsInView != null) {
            return (isInView: boolean) => {
                setIsInView(endpoint, isInView);
            };
        } else {
            return undefined;
        }
    }, [endpoint, setIsInView]);

    const { ref: setRefForInViewIntersectionObserver } = useInView({
        threshold: 0.5,
        onChange: onChangeIsInView,
    });

    const onChangeIsInVerticalCenter = useCallback(() => {
        setPathInView(path);
    }, [path, setPathInView]);

    const { ref: setRefForInVerticalCenterIntersectionObserver } = useInView({
        // https://stackoverflow.com/questions/54807535/intersection-observer-api-observe-the-center-of-the-viewport
        rootMargin: "-50% 0% -50% 0%",
        threshold: 0,
        onChange: onChangeIsInVerticalCenter,
    });

    const containerRef = useRef<HTMLDivElement | null>(null);
    const setContainerRef = useCallback(
        (ref: HTMLDivElement | null) => {
            setRefForInViewIntersectionObserver(ref);
            setRefForInVerticalCenterIntersectionObserver(ref);
            containerRef.current = ref;
        },
        [setRefForInVerticalCenterIntersectionObserver, setRefForInViewIntersectionObserver]
    );

    useEffect(() => {
        const unsubscribe = registerNavigateToPathListener(path, () => {
            containerRef.current?.scrollIntoView();
        });
        return unsubscribe;
    }, [path, registerNavigateToPathListener]);

    return (
        <div className="flex-1 flex gap-24 px-24 min-w-0" id={endpoint.urlSlug} ref={setContainerRef}>
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
    );
};
