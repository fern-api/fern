import { FernRegistry } from "@fern-fern/registry";
import { MonospaceText } from "../../../commons/MonospaceText";
import { DefinitionItemPage } from "../DefinitionItemPage";
import { EndpointPathParameter } from "./EndpointPathParameter";
import { EndpointSection } from "./EndpointSection";
import { EndpointTitle } from "./EndpointTitle";
import { EndpointTypeSection } from "./EndpointTypeSection";
import { PathParametersSection } from "./PathParametersSection";
import { QueryParametersSection } from "./QueryParametersSection";

export declare namespace Endpoint {
    export interface Props {
        endpoint: FernRegistry.EndpointDefinition;
    }
}

export const Endpoint: React.FC<Endpoint.Props> = ({ endpoint }) => {
    return (
        <DefinitionItemPage
            title={<EndpointTitle endpoint={endpoint} />}
            subtitle={
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
            }
            description={endpoint.description}
        >
            <div className="flex flex-1 flex-col gap-12">
                {endpoint.path.pathParameters.length > 0 && (
                    <PathParametersSection pathParameters={endpoint.path.pathParameters} />
                )}
                {endpoint.queryParameters.length > 0 && (
                    <QueryParametersSection queryParameters={endpoint.queryParameters} />
                )}
                <EndpointSection title="Request">
                    {endpoint.request != null ? (
                        <EndpointTypeSection httpBody={endpoint.request} preamble="The request for this endpoint is" />
                    ) : (
                        <div>This endpoint does not expect a request body.</div>
                    )}
                </EndpointSection>
                <EndpointSection title="Response">
                    {endpoint.response != null ? (
                        <EndpointTypeSection httpBody={endpoint.response} preamble="This endpoint returns" />
                    ) : (
                        <div>This endpoint does not return a response.</div>
                    )}
                </EndpointSection>
            </div>
        </DefinitionItemPage>
    );
};
