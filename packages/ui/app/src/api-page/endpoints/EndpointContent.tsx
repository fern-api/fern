import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import React, { useCallback, useMemo, useState } from "react";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { visitDiscriminatedUnion } from "../../utils/visitDiscriminatedUnion";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { Markdown } from "../markdown/Markdown";
import { ApiPageMargins } from "../page-margins/ApiPageMargins";
import { useEndpointContext } from "./endpoint-context/useEndpointContext";
import { EndpointExamples } from "./endpoint-examples/EndpointExamples";
import { EndpointMethodPill } from "./EndpointMethodPill";
import { EndpointPathParameter } from "./EndpointPathParameter";
import { EndpointRequestSection } from "./EndpointRequestSection";
import { EndpointResponseSection } from "./EndpointResponseSection";
import { EndpointSection } from "./EndpointSection";
import { EndpointTitle } from "./EndpointTitle";
import { getEndpointEnvironmentUrl } from "./getEndpointEnvironmentUrl";
import { PathParametersSection } from "./PathParametersSection";
import { QueryParametersSection } from "./QueryParametersSection";

export declare namespace EndpointContent {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        setContainerRef: (ref: HTMLElement | null) => void;
    }
}

export const EndpointContent = React.memo<EndpointContent.Props>(function EndpointContent({
    endpoint,
    setContainerRef,
}) {
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

    const [titleHeight, setTitleHeight] = useState<number>();
    const setTitleRef = useCallback(
        (ref: HTMLElement | null) => {
            if (titleHeight == null && ref != null) {
                setTitleHeight(ref.getBoundingClientRect().height);
            }
        },
        [titleHeight]
    );

    const environmentUrl = useMemo(() => getEndpointEnvironmentUrl(endpoint), [endpoint]);

    return (
        <ApiPageMargins>
            <div
                className={classNames("flex min-w-0 flex-1 space-x-[5vw]", "flex-col md:flex-row")}
                ref={setContainerRef}
            >
                <div className="flex flex-1 flex-col">
                    <div className="pb-8 pt-20 text-3xl font-medium" ref={setTitleRef}>
                        <EndpointTitle endpoint={endpoint} />
                    </div>
                    <div className="flex items-center gap-2">
                        <EndpointMethodPill endpoint={endpoint} />
                        <MonospaceText className="text-text-default break-all">
                            {environmentUrl}
                            {endpoint.path.parts.map((part, index) => (
                                <React.Fragment key={index}>
                                    {visitDiscriminatedUnion(part, "type")._visit<JSX.Element | string | null>({
                                        literal: (literal) => literal.value,
                                        pathParameter: (pathParameter) => (
                                            <EndpointPathParameter pathParameter={pathParameter.value} />
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
                            "flex-1 sticky self-start top-0 min-w-0",
                            // the py-10 is the same as the 40px below
                            "py-10",
                            // the 4rem is the same as the h-10 as the Header
                            "max-h-[calc(100vh-4rem)]",
                            // hide on mobile,
                            "hidden md:flex"
                        )}
                        style={{
                            // the 40px is the same as the py-10 above
                            marginTop: titleHeight - 40,
                        }}
                    >
                        <EndpointExamples endpoint={endpoint} />
                    </div>
                )}
                <div className="flex max-h-[150vh] md:hidden">
                    <EndpointExamples endpoint={endpoint} />
                </div>
            </div>
        </ApiPageMargins>
    );
});
