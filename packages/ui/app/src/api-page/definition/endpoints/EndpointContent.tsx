import { FernRegistry } from "@fern-fern/registry";
import { useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { MonospaceText } from "../../../commons/MonospaceText";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
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
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const EndpointContent: React.FC<EndpointContent.Props> = ({ endpoint }) => {
    const { urlPathResolver } = useApiDefinitionContext();

    const hash = urlPathResolver.getHashForEndpoint(endpoint.id);
    const htmlId = urlPathResolver.getHtmlIdForEndpoint(endpoint.id);
    const ref = useRef<HTMLDivElement | null>(null);
    const currentHash = useLocation().hash;
    useEffect(() => {
        if (currentHash === hash) {
            ref.current?.scrollIntoView();
        }
    }, [currentHash, hash]);

    const { setHoveredResponsePropertyPath } = useEndpointContext();
    const onHoverResponseProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredResponsePropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredResponsePropertyPath]
    );

    return (
        <div className="flex-1 flex gap-24 px-24 min-w-0" id={htmlId} ref={ref}>
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
                                <EndpointTypeSection httpBody={endpoint.request} />
                            </EndpointSection>
                        )}
                        {endpoint.response != null && (
                            <EndpointSection title="Response">
                                <EndpointTypeSection
                                    httpBody={endpoint.response}
                                    onHoverProperty={onHoverResponseProperty}
                                />
                            </EndpointSection>
                        )}
                    </div>
                </div>
            </div>
            <div className="flex-1 flex sticky self-start top-0 max-h-[calc(100vh-20px)] min-w-0">
                <EndpointExamples endpoint={endpoint} />
            </div>
        </div>
    );
};
