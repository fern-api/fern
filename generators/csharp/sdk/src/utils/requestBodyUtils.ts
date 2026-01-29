import { HttpRequestBody, InlinedRequestBodyProperty, ObjectProperty } from "@fern-fern/ir-sdk/api";
import { SdkGeneratorContext } from "../SdkGeneratorContext";

export type RequestBodyProperty = InlinedRequestBodyProperty | ObjectProperty;

/**
 * Extracts non-literal properties from a request body (handles both inline and referenced types).
 * Returns an array of properties that can be used as credentials or parameters.
 */
export function getRequestBodyProperties(
    context: SdkGeneratorContext,
    requestBody: HttpRequestBody | undefined
): RequestBodyProperty[] {
    if (!requestBody) {
        return [];
    }

    const properties: RequestBodyProperty[] = [];

    requestBody._visit({
        inlinedRequestBody: (inlinedRequestBody) => {
            for (const prop of inlinedRequestBody.properties) {
                // Skip literal types - they are hardcoded in the request
                if (prop.valueType.type === "container" && prop.valueType.container.type === "literal") {
                    continue;
                }
                properties.push(prop);
            }
        },
        reference: (reference) => {
            // Handle referenced request body types by resolving the type and extracting properties
            if (reference.requestBodyType.type === "named") {
                const { typeDeclaration } = context.model.dereferenceType(reference.requestBodyType.typeId);

                if (typeDeclaration.shape.type === "object") {
                    const objectShape = typeDeclaration.shape;
                    // Process all properties from the referenced object type
                    for (const prop of objectShape.properties) {
                        // Skip literal types - they are hardcoded in the request
                        if (prop.valueType.type === "container" && prop.valueType.container.type === "literal") {
                            continue;
                        }
                        properties.push(prop);
                    }
                }
            }
        },
        fileUpload: () => {
            // File uploads are not supported for token endpoints
        },
        bytes: () => {
            // Bytes are not supported for token endpoints
        },
        _other: () => {
            // Other request body types are not supported
        }
    });

    return properties;
}
