import { assertNever } from "@fern-api/core-utils";
import { isRawTextType, parseRawFileType, parseRawTextType, RawSchemas } from "@fern-api/yaml-schema";
import { HttpResponse, JsonResponse, ObjectProperty, StreamingResponseChunkType } from "@fern-fern/ir-sdk/api";
import { FernFileContext } from "../../FernFileContext";
import { ResolvedType } from "../../resolvers/ResolvedType";
import { TypeResolver } from "../../resolvers/TypeResolver";
import { getObjectPropertiesFromRawObjectSchema } from "../type-declarations/convertObjectTypeDeclaration";

export async function convertHttpResponse({
    endpoint,
    file,
    typeResolver
}: {
    endpoint: RawSchemas.HttpEndpointSchema;
    file: FernFileContext;
    typeResolver: TypeResolver;
}): Promise<HttpResponse | undefined> {
    const { response, ["response-stream"]: responseStream } = endpoint;

    if (response != null) {
        const docs = typeof response !== "string" ? response.docs : undefined;
        const responseType = typeof response === "string" ? response : response.type;

        if (parseRawFileType(responseType) != null) {
            return HttpResponse.fileDownload({
                docs
            });
        } else if (parseRawTextType(responseType) != null) {
            return HttpResponse.text({
                docs
            });
        } else {
            return await convertJsonResponse(response, docs, file, typeResolver);
        }
    }

    if (responseStream != null) {
        return HttpResponse.streaming({
            docs: typeof responseStream !== "string" ? responseStream.docs : undefined,
            dataEventType: constructStreamingResponseChunkType(responseStream, file),
            terminator: typeof responseStream !== "string" ? responseStream.terminator : undefined
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

async function convertJsonResponse(
    response: RawSchemas.HttpResponseSchema | string,
    docs: string | undefined,
    file: FernFileContext,
    typeResolver: TypeResolver
): Promise<HttpResponse> {
    const responseBodyType = file.parseTypeReference(response);
    const resolvedType = typeResolver.resolveTypeOrThrow({
        type: typeof response !== "string" ? response.type : response,
        file
    });
    const responseProperty = typeof response !== "string" ? response.property : undefined;
    if (responseProperty != null) {
        return HttpResponse.json(
            JsonResponse.nestedPropertyAsResponse({
                docs,
                responseBodyType,
                responseProperty: await getObjectPropertyFromResolvedType(
                    resolvedType,
                    responseProperty,
                    file,
                    typeResolver
                )
            })
        );
    }
    return HttpResponse.json(
        JsonResponse.response({
            docs,
            responseBodyType
        })
    );
}

async function getObjectPropertyFromResolvedType(
    resolvedType: ResolvedType,
    property: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): Promise<ObjectProperty> {
    switch (resolvedType._type) {
        case "container":
            if (resolvedType.container._type === "optional") {
                return await getObjectPropertyFromResolvedType(
                    resolvedType.container.itemType,
                    property,
                    file,
                    typeResolver
                );
            }
            break;
        case "named":
            if (isRawObjectDefinition(resolvedType.declaration)) {
                return await getObjectPropertyFromObjectSchema(
                    resolvedType.declaration,
                    property,
                    resolvedType.file,
                    typeResolver
                );
            }
            break;
        case "primitive":
        case "unknown":
            break;
        default:
            assertNever(resolvedType);
    }
    throw new Error("Internal error; response must be an object in order to return a property as a response");
}

async function getObjectPropertyFromObjectSchema(
    objectSchema: RawSchemas.ObjectSchema,
    property: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): Promise<ObjectProperty> {
    const properties = await getAllPropertiesForRawObjectSchema(objectSchema, file, typeResolver);
    const objectProperty = properties[property];
    if (objectProperty == null) {
        throw new Error(`Response does not have a property named ${property}.`);
    }
    return objectProperty;
}

async function getAllPropertiesForRawObjectSchema(
    objectSchema: RawSchemas.ObjectSchema,
    file: FernFileContext,
    typeResolver: TypeResolver
): Promise<Record<string, ObjectProperty>> {
    let extendedTypes: string[] = [];
    if (typeof objectSchema.extends === "string") {
        extendedTypes = [objectSchema.extends];
    } else if (Array.isArray(objectSchema.extends)) {
        extendedTypes = objectSchema.extends;
    }

    const properties: Record<string, ObjectProperty> = {};
    for (const extendedType of extendedTypes) {
        const extendedProperties = await getAllPropertiesForExtendedType(extendedType, file, typeResolver);
        Object.entries(extendedProperties).map(([propertyKey, objectProperty]) => {
            properties[propertyKey] = objectProperty;
        });
    }

    const objectProperties = await getObjectPropertiesFromRawObjectSchema(objectSchema, file);
    objectProperties.forEach((objectProperty) => {
        properties[objectProperty.name.name.originalName] = objectProperty;
    });

    return properties;
}

async function getAllPropertiesForExtendedType(
    extendedType: string,
    file: FernFileContext,
    typeResolver: TypeResolver
): Promise<Record<string, ObjectProperty>> {
    const resolvedType = typeResolver.resolveNamedTypeOrThrow({
        referenceToNamedType: extendedType,
        file
    });
    if (resolvedType._type === "named" && isRawObjectDefinition(resolvedType.declaration)) {
        return await getAllPropertiesForRawObjectSchema(resolvedType.declaration, file, typeResolver);
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
