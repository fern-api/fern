import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import classNames from "classnames";
import React, { useCallback, useMemo, useState } from "react";
import { MonospaceText } from "../../commons/monospace/MonospaceText";
import { SeparatedElements } from "../../commons/SeparatedElements";
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

// TODO: Might want to place this type guard elsewhere
function isSubpackage(
    package_: FernRegistryApiRead.ApiDefinitionPackage
): package_ is FernRegistryApiRead.ApiDefinitionSubpackage {
    return typeof (package_ as FernRegistryApiRead.ApiDefinitionSubpackage).subpackageId === "string";
}

export declare namespace EndpointContent {
    export interface Props {
        endpoint: FernRegistryApiRead.EndpointDefinition;
        package: FernRegistryApiRead.ApiDefinitionPackage;
        setContainerRef: (ref: HTMLElement | null) => void;
    }
}

export const EndpointContent = React.memo<EndpointContent.Props>(function EndpointContent({
    endpoint,
    package: package_,
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

    const computePropertyAnchor = useCallback(
        (type: "request" | "response", property: FernRegistryApiRead.ObjectProperty) => {
            let anchor = "";
            if (isSubpackage(package_)) {
                anchor += package_.urlSlug + "_";
            }
            anchor += endpoint.id;
            anchor += "_" + type + "_";
            anchor += property.key;
            return anchor;
        },
        [package_, endpoint]
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
                    <div className="flex">
                        <div className="flex overflow-hidden rounded">
                            <EndpointMethodPill endpoint={endpoint} />
                            <MonospaceText className="text-text-default flex flex-wrap items-center bg-white/5 px-2 py-1">
                                {environmentUrl}
                                {endpoint.path.parts.map((part, index) => (
                                    <React.Fragment key={index}>
                                        {visitDiscriminatedUnion(part, "type")._visit<JSX.Element | string | null>({
                                            literal: (literal) => (
                                                <SeparatedElements
                                                    separator={
                                                        <>
                                                            /<wbr />
                                                        </>
                                                    }
                                                >
                                                    {literal.value.split("/").map((part, index) => (
                                                        <React.Fragment key={index}>{part}</React.Fragment>
                                                    ))}
                                                </SeparatedElements>
                                            ),
                                            pathParameter: (pathParameter) => (
                                                <>
                                                    <wbr />
                                                    <EndpointPathParameter pathParameter={pathParameter.value} />
                                                    <wbr />
                                                </>
                                            ),
                                            _other: () => null,
                                        })}
                                    </React.Fragment>
                                ))}
                            </MonospaceText>
                        </div>
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
                                        getPropertyAnchor={(property) => computePropertyAnchor("request", property)}
                                    />
                                </EndpointSection>
                            )}
                            {endpoint.response != null && (
                                <EndpointSection title="Response">
                                    <EndpointResponseSection
                                        httpResponse={endpoint.response}
                                        onHoverProperty={onHoverResponseProperty}
                                        getPropertyAnchor={(property) => computePropertyAnchor("response", property)}
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
