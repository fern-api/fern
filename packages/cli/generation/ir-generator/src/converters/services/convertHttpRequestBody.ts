import { isInlineRequestBody, RawSchemas } from "@fern-api/yaml-schema";
import { HttpRequestBody, HttpRequestBodyReference } from "@fern-fern/ir-model/services/http";
import { FernFileContext } from "../../FernFileContext";
import { parseTypeName } from "../../utils/parseTypeName";
import { getExtensionsAsList, getPropertyName } from "../type-declarations/convertObjectTypeDeclaration";

export function convertHttpRequestBody({
    request,
    file,
}: {
    request: string | RawSchemas.HttpRequestSchema | null | undefined;
    file: FernFileContext;
}): HttpRequestBody | undefined {
    if (typeof request === "string") {
        return HttpRequestBody.reference(convertReferenceHttpRequestBody(request, file));
    }

    if (request?.body == null) {
        return undefined;
    }

    if (isInlineRequestBody(request.body)) {
        if (request.name == null) {
            throw new Error("Name is missing for inlined request");
        }

        return HttpRequestBody.inlinedRequestBody({
            name: file.casingsGenerator.generateName(request.name),
            extends: getExtensionsAsList(request.body.extends).map((extended) =>
                parseTypeName({ typeName: extended, file })
            ),
            properties:
                request.body.properties != null
                    ? Object.entries(request.body.properties).map(([propertyKey, propertyDefinition]) => ({
                          docs: typeof propertyDefinition !== "string" ? propertyDefinition.docs : undefined,
                          name: file.casingsGenerator.generateNameAndWireValue({
                              wireValue: propertyKey,
                              name: getPropertyName({ propertyKey, property: propertyDefinition }).name,
                          }),
                          valueType: file.parseTypeReference(propertyDefinition),
                      }))
                    : [],
        });
    }

    return HttpRequestBody.reference(convertReferenceHttpRequestBody(request.body, file));
}

export function convertReferenceHttpRequestBody(
    requestBody: RawSchemas.HttpReferencedRequestBodySchema | string,
    file: FernFileContext
): HttpRequestBodyReference {
    return {
        docs: typeof requestBody !== "string" ? requestBody.docs : undefined,
        requestBodyType: file.parseTypeReference(requestBody),
    };
}
