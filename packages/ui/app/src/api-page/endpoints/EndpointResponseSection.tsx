import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { Description } from "../types/Description";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointResponseSection {
    export interface Props {
        httpResponse: FernRegistryApiRead.HttpResponse;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
    }
}

export const EndpointResponseSection: React.FC<EndpointResponseSection.Props> = ({ httpResponse, onHoverProperty }) => {
    return (
        <div className="flex flex-col">
            <Description description={httpResponse.description} />
            <div className="text-text-default mb-5">
                {"This endpoint returns "}
                {httpResponse.type._visit<JSX.Element | string>({
                    object: () => "an object",
                    reference: (type) => <TypeShorthand type={type} plural={false} withArticle />,
                    fileDownload: () => "a file",
                    _other: () => "unknown",
                })}
                .
            </div>
            {httpResponse.type._visit({
                object: (object) => (
                    <TypeDefinition
                        typeShape={FernRegistryApiRead.TypeShape.object(object)}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                    />
                ),
                reference: (type) => (
                    <TypeReferenceDefinitions type={type} isCollapsible={false} onHoverProperty={onHoverProperty} />
                ),
                fileDownload: () => null,
                _other: () => null,
            })}
        </div>
    );
};
