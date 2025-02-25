import {
    RawSchemas,
    isInlineRequestBody,
    parseBytesRequest,
    parseFileUploadRequest
} from "@fern-api/fern-definition-schema";
import {
    Availability,
    FileProperty,
    FileUploadRequestProperty,
    HttpRequestBody,
    HttpRequestBodyReference,
    InlinedRequestBodyProperty
} from "@fern-api/ir-sdk";

import { FernFileContext } from "../../FernFileContext";
import { parseTypeName } from "../../utils/parseTypeName";
import { convertAvailability } from "../convertDeclaration";
import { getExtensionsAsList, getPropertyName } from "../type-declarations/convertObjectTypeDeclaration";

export function convertHttpRequestBody({
    request,
    file
}: {
    request: string | RawSchemas.HttpRequestSchema | null | undefined;
    file: FernFileContext;
}): HttpRequestBody | undefined {
    const bytesRequest = request != null ? parseBytesRequest(request) : undefined;
    if (bytesRequest != null) {
        const response = HttpRequestBody.bytes({
            isOptional: bytesRequest.isOptional,
            contentType: typeof request === "string" ? undefined : request?.["content-type"],
            docs: typeof request === "string" ? undefined : request?.docs
        });
        return response;
    }

    if (typeof request === "string") {
        const response = HttpRequestBody.reference(
            convertReferenceHttpRequestBody({
                requestBody: request,
                file
            })
        );
        return response;
    }

    if (request?.body == null) {
        return undefined;
    }

    const fileUploadRequest = parseFileUploadRequest(request);
    if (fileUploadRequest != null) {
        const response = HttpRequestBody.fileUpload({
            name: file.casingsGenerator.generateName(fileUploadRequest.name),
            properties: fileUploadRequest.properties.map((property) => {
                if (property.isFile) {
                    if (property.isArray) {
                        return FileUploadRequestProperty.file(
                            FileProperty.fileArray({
                                key: file.casingsGenerator.generateNameAndWireValue({
                                    wireValue: property.key,
                                    name: property.key
                                }),
                                isOptional: property.isOptional,
                                contentType: property.contentType
                            })
                        );
                    } else {
                        return FileUploadRequestProperty.file(
                            FileProperty.file({
                                key: file.casingsGenerator.generateNameAndWireValue({
                                    wireValue: property.key,
                                    name: property.key
                                }),
                                isOptional: property.isOptional,
                                contentType: property.contentType
                            })
                        );
                    }
                } else {
                    return FileUploadRequestProperty.bodyProperty({
                        ...convertInlinedRequestProperty({
                            propertyKey: property.key,
                            propertyDefinition: property.propertyType,
                            docs: property.docs,
                            availability: convertAvailability(property.availability),
                            file
                        }),
                        style: property.style,
                        contentType: property.contentType
                    });
                }
            }),
            docs: request.docs
        });
        return response;
    }

    if (isInlineRequestBody(request.body)) {
        if (request.name == null) {
            throw new Error("Name is missing for inlined request");
        }

        const response = HttpRequestBody.inlinedRequestBody({
            name: file.casingsGenerator.generateName(request.name),
            extends: getExtensionsAsList(request.body.extends).map((extended) =>
                parseTypeName({ typeName: extended, file })
            ),
            contentType: request["content-type"],
            docs: request.docs,
            properties:
                request.body.properties != null
                    ? Object.entries(request.body.properties).map(([propertyKey, propertyDefinition]) =>
                          convertInlinedRequestProperty({
                              propertyKey,
                              propertyDefinition,
                              docs: typeof propertyDefinition !== "string" ? propertyDefinition.docs : undefined,
                              availability:
                                  typeof propertyDefinition !== "string"
                                      ? convertAvailability(propertyDefinition.availability)
                                      : undefined,
                              file
                          })
                      )
                    : [],
            extraProperties: request.body["extra-properties"] ?? false,
            extendedProperties: undefined
        });
        return response;
    }

    const response = HttpRequestBody.reference(
        convertReferenceHttpRequestBody({
            requestBody: request.body,
            file,
            contentType: request["content-type"]
        })
    );
    return response;
}

export function convertReferenceHttpRequestBody({
    requestBody,
    file,
    contentType
}: {
    requestBody: RawSchemas.HttpReferencedRequestBodySchema | string;
    file: FernFileContext;
    contentType?: string;
}): HttpRequestBodyReference {
    return {
        docs: typeof requestBody !== "string" ? requestBody.docs : undefined,
        requestBodyType: file.parseTypeReference(requestBody),
        contentType
    };
}

function convertInlinedRequestProperty({
    propertyKey,
    propertyDefinition,
    docs,
    availability,
    file
}: {
    propertyKey: string;
    propertyDefinition: RawSchemas.ObjectPropertySchema;
    docs: string | undefined;
    availability: Availability | undefined;
    file: FernFileContext;
}): InlinedRequestBodyProperty {
    return {
        docs,
        availability,
        name: file.casingsGenerator.generateNameAndWireValue({
            wireValue: propertyKey,
            name: getPropertyName({ propertyKey, property: propertyDefinition }).name
        }),
        valueType: file.parseTypeReference(propertyDefinition)
    };
}
