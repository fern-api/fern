import { isInlineRequestBody, parseFileUploadRequest, RawSchemas } from "@fern-api/yaml-schema";
import {
    FileUploadRequestProperty,
    HttpRequestBody,
    HttpRequestBodyReference,
    InlinedRequestBodyProperty,
} from "@fern-fern/ir-model/http";
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

    const fileUploadRequest = parseFileUploadRequest(request);
    if (fileUploadRequest != null) {
        return HttpRequestBody.fileUpload({
            name: file.casingsGenerator.generateName(fileUploadRequest.name),
            properties: fileUploadRequest.properties.map((property) => {
                if (property.isFile) {
                    return FileUploadRequestProperty.file({
                        key: file.casingsGenerator.generateNameAndWireValue({
                            wireValue: property.key,
                            name: property.key,
                        }),
                    });
                } else {
                    return FileUploadRequestProperty.bodyProperty(
                        convertInlinedRequestProperty(property.key, property.propertyType, property.docs, file)
                    );
                }
            }),
        });
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
                    ? Object.entries(request.body.properties).map(([propertyKey, propertyDefinition]) =>
                          convertInlinedRequestProperty(
                              propertyKey,
                              propertyDefinition,
                              typeof propertyDefinition !== "string" ? propertyDefinition.docs : undefined,
                              file
                          )
                      )
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

function convertInlinedRequestProperty(
    propertyKey: string,
    propertyDefinition: RawSchemas.ObjectPropertySchema,
    docs: string | undefined,
    file: FernFileContext
): InlinedRequestBodyProperty {
    return {
        docs,
        name: file.casingsGenerator.generateNameAndWireValue({
            wireValue: propertyKey,
            name: getPropertyName({ propertyKey, property: propertyDefinition }).name,
        }),
        valueType: file.parseTypeReference(propertyDefinition),
    };
}
