import { visitDiscriminatedUnion } from "@fern-api/core-utils";
import * as FernRegistryApiRead from "@fern-fern/registry-browser/api/resources/api/resources/v1/resources/read";
import { JsonPropertyPath } from "../api-page/examples/json-example/contexts/JsonPropertyPath";
import { TypeDefinition } from "../api-page/types/type-definition/TypeDefinition";
import { TypeReferenceDefinitions } from "../api-page/types/type-reference/TypeReferenceDefinitions";
import { TypeShorthand } from "../api-page/types/type-shorthand/TypeShorthand";

export declare namespace WebhookRequestSection {
    export interface Props {
        httpRequestBody: FernRegistryApiRead.HttpRequestBodyShape;
        onHoverProperty?: (path: JsonPropertyPath, opts: { isHovering: boolean }) => void;
        getPropertyAnchor?: (property: FernRegistryApiRead.ObjectProperty) => string;
    }
}

export const WebhookRequestSection: React.FC<WebhookRequestSection.Props> = ({
    httpRequestBody,
    onHoverProperty,
    getPropertyAnchor,
}) => {
    return (
        <div className="flex flex-col">
            <div className="text-text-default border-border border-b pb-5 text-sm leading-6">
                {"The payload of this webhook request is "}
                {visitDiscriminatedUnion(httpRequestBody, "type")._visit<JSX.Element | string>({
                    object: () => "an object",
                    reference: (type) => <TypeShorthand type={type.value} plural={false} withArticle />,
                    fileUpload: () => "a file",
                    _other: () => "unknown",
                })}
                .
            </div>
            {visitDiscriminatedUnion(httpRequestBody, "type")._visit({
                object: (object) => (
                    <TypeDefinition
                        typeShape={object}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        getPropertyAnchor={getPropertyAnchor}
                    />
                ),
                reference: (type) => (
                    <TypeReferenceDefinitions
                        type={type.value}
                        isCollapsible={false}
                        onHoverProperty={onHoverProperty}
                        getPropertyAnchor={getPropertyAnchor}
                    />
                ),
                fileUpload: () => null,
                _other: () => null,
            })}
        </div>
    );
};
