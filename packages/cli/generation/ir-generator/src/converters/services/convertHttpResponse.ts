import { isRawTextType, parseRawFileType, parseRawTextType, RawSchemas } from "@fern-api/yaml-schema";
import { HttpResponse, JsonResponse, StreamingResponseChunkType, TypeReference } from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../../FernFileContext";
import { TypeResolver } from "../../resolvers/TypeResolver";

export function convertHttpResponse({
    endpoint,
    file,
    typeResolver,
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): HttpResponse | undefined {
    const { response, ["response-stream"]: responseStream } = endpoint;

    if (response != null) {
        const docs = typeof response !== "string" ? response.docs : undefined;
        const responseType = typeof response === "string" ? response : response.type;

        if (parseRawFileType(responseType) != null) {
            return HttpResponse.fileDownload({
                docs,
            });
        } else if (parseRawTextType(responseType) != null) {
            return HttpResponse.text({
                docs,
            });
        } else {
            return convertJsonResponse(response, docs, file, typeResolver);
        }
    }

    if (responseStream != null) {
        return HttpResponse.streaming({
            docs: typeof responseStream !== "string" ? responseStream.docs : undefined,
            dataEventType: constructStreamingResponseChunkType(responseStream, file),
            terminator: typeof responseStream !== "string" ? responseStream.terminator : undefined,
        });
    }

    return undefined;
}

function constructStreamingResponseChunkType(
    responseStream: RawSchemas.HttpResponseStreamSchema | string,
    file: FernFileContext
): StreamingResponseChunkType {
    const typeReference = typeof responseStream === "string" ? responseStream : responseStream.type;
    if (isRawTextType(typeReference)) {
        return StreamingResponseChunkType.text();
    } else {
        return StreamingResponseChunkType.json(file.parseTypeReference(typeReference));
    }
}

function convertJsonResponse(
    response: RawSchemas.HttpResponseSchema | string,
    docs: string | undefined,
    file: FernFileContext,
    typeResolver: TypeResolver
): HttpResponse {
    const responseBodyType = file.parseTypeReference(response);
    const responseProperty = typeof response !== "string" ? response.property : undefined;
    if (
        responseProperty !== undefined &&
        !typeReferenceHasProperty(responseBodyType, responseProperty, file, typeResolver)
    ) {
        throw new Error(`Response does not have a property named ${responseProperty}`);
    }
    if (responseProperty !== undefined) {
        return HttpResponse.json(
            JsonResponse.nestedPropertyAsResponse({
                docs,
                responseBodyType,
                responseProperty:
                    responseProperty !== undefined ? file.casingsGenerator.generateName(responseProperty) : undefined,
            })
        );
    }
    return HttpResponse.json(
        JsonResponse.response({
            docs,
            responseBodyType,
        })
    );
}

function typeReferenceHasProperty(
    typeReference: TypeReference,
    property: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): boolean {
    if (typeReference.type === "container" && typeReference.container.type === "optional") {
        return typeReferenceHasProperty(typeReference.container.optional, property, file, typeResolver);
    }
    if (typeReference.type === "named") {
        const resolvedType = typeResolver.resolveNamedTypeOrThrow({
            referenceToNamedType: typeReference.name.originalName,
            file,
        });
        switch (resolvedType._type) {
            case "container":
                return typeReferenceHasProperty(resolvedType.originalTypeReference, property, file, typeResolver);
            case "named":
                if (isRawObjectDefinition(resolvedType.declaration)) {
                    return rawObjectSchemaHasProperty(resolvedType.declaration, property, file, typeResolver);
                }
                throw new Error("A custom response property is only supported for objects");
        }
    }
    return false;
}

function rawObjectSchemaHasProperty(
    objectSchema: RawSchemas.ObjectSchema,
    property: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): boolean {
    const properties = getAllPropertiesForRawObjectSchema(objectSchema, file, typeResolver);
    return properties.has(property);
}

function getAllPropertiesForRawObjectSchema(
    objectSchema: RawSchemas.ObjectSchema,
    file: FernFileContext,
    typeResolver: TypeResolver
): Set<string> {
    let extendedTypes: string[] = [];
    if (typeof objectSchema.extends === "string") {
        extendedTypes = [objectSchema.extends];
    } else if (Array.isArray(objectSchema.extends)) {
        extendedTypes = objectSchema.extends;
    }

    const properties = new Set<string>();
    for (const extendedType of extendedTypes) {
        for (const extendedProperty of getAllPropertiesForExtendedType(extendedType, file, typeResolver)) {
            properties.add(extendedProperty);
        }
    }

    for (const propertyKey of Object.keys(objectSchema.properties ?? {})) {
        properties.add(propertyKey);
    }

    return properties;
}

function getAllPropertiesForExtendedType(
    extendedType: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): Set<string> {
    const resolvedType = typeResolver.resolveNamedTypeOrThrow({
        referenceToNamedType: extendedType,
        file,
    });
    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return getAllPropertiesForRawObjectSchema(resolvedType.declaration, file, typeResolver);
    }
    // This should be unreachable; extended types must be named objects.
    throw new Error(`Extended type ${extendedType} must be another named type`);
}

type NamedDeclaration =
    | RawSchemas.ObjectSchema
    | RawSchemas.DiscriminatedUnionSchema
    | RawSchemas.UndiscriminatedUnionSchema
    | RawSchemas.EnumSchema;

function isRawObjectDefinition(namedDeclaration: NamedDeclaration): namedDeclaration is RawSchemas.ObjectSchema {
    return (
        (namedDeclaration as RawSchemas.ObjectSchema).extends != null ||
        (namedDeclaration as RawSchemas.ObjectSchema).properties != null
    );
}
