import { FernRegistry } from "@fern-fern/registry";
import { useCallback, useEffect, useRef } from "react";
import { useInView } from "react-intersection-observer";
import { MonospaceText } from "../../../commons/MonospaceText";
import { ResolvedUrlPath } from "../../api-context/url-path-resolver/UrlPathResolver";
import { useApiDefinitionContext } from "../../api-context/useApiDefinitionContext";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { Markdown } from "../markdown/Markdown";
import { useSubpackageContext } from "../subpackages/context/SubpackageContext";
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
        resolvedUrlPath: ResolvedUrlPath;
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const EndpointContent: React.FC<EndpointContent.Props> = ({ resolvedUrlPath, endpoint }) => {
    const { urlPathResolver, registerSidebarItemClickListener } = useApiDefinitionContext();

    const { setHoveredResponsePropertyPath } = useEndpointContext();
    const onHoverResponseProperty = useCallback(
        (jsonPropertyPath: JsonPropertyPath, { isHovering }: { isHovering: boolean }) => {
            setHoveredResponsePropertyPath(isHovering ? jsonPropertyPath : undefined);
        },
        [setHoveredResponsePropertyPath]
    );

    const { setIsEndpointInView } = useSubpackageContext();
    const onChangeIsInView = useCallback(
        (isInView: boolean) => {
            setIsEndpointInView(endpoint.id, isInView);
        },
        [endpoint.id, setIsEndpointInView]
    );

    const { ref: setRefForIntersectionObserver } = useInView({
        threshold: 0.5,
        onChange: onChangeIsInView,
    });

    const containerRef = useRef<HTMLDivElement | null>(null);
    const setContainerRef = useCallback(
        (ref: HTMLDivElement | null) => {
            setRefForIntersectionObserver(ref);
            containerRef.current = ref;
        },
        [setRefForIntersectionObserver]
    );

    useEffect(() => {
        const unsubscribe = registerSidebarItemClickListener(resolvedUrlPath, () => {
            containerRef.current?.scrollIntoView();
        });
        return unsubscribe;
    }, [registerSidebarItemClickListener, resolvedUrlPath]);

    return (
        <div
            className="flex-1 flex gap-24 px-24 min-w-0"
            id={urlPathResolver.getHtmlIdForEndpoint(endpoint.id)}
            ref={setContainerRef}
        >
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
