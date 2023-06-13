import * as FernRegistryApiRead from "@fern-fern/registry-browser/serialization/resources/api/resources/v1/resources/read";
import { visitDiscriminatedUnion } from "../../utils/visitDiscriminatedUnion";
import { JsonPropertyPath } from "../examples/json-example/contexts/JsonPropertyPath";
import { Description } from "../types/Description";
import { TypeDefinition } from "../types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../types/type-shorthand/TypeShorthand";

export declare namespace EndpointResponseSection {
    export interface Props {
        httpResponse: FernRegistryApiRead.HttpResponse.Raw;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
    }
}

export const EndpointResponseSection: React.FC<EndpointResponseSection.Props> = ({ httpResponse, onHoverProperty }) => {
    return (
        <div className="flex flex-col">
            <Description description={httpResponse.description ?? undefined} />
            <div className="text-text-default mb-5">
                {"This endpoint returns "}
                {visitDiscriminatedUnion(httpResponse.type, "type")._visit<JSX.Element | string>({
                    object: () => "an object",
                    reference: (type) => <TypeShorthand type={type.value} plural={false} withArticle />,
                    fileDownload: () => "a file",
                    _other: () => "unknown",
                })}
                .
            </div>
            {visitDiscriminatedUnion(httpResponse.type, "type")._visit({
                object: (object) => (
                    <TypeDefinition typeShape={object} isCollapsible={false} onHoverProperty={onHoverProperty} />
                ),
                reference: (type) => (
                    <TypeReferenceDefinitions
                        type={type.value}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                    />
                ),
                fileDownload: () => null,
                _other: () => null,
            })}
        </div>
    );
};
