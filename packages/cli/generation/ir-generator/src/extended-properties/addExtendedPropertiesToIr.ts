import {
    DeclaredTypeName,
    HttpEndpoint,
    IntermediateRepresentation,
    ObjectProperty,
    ObjectTypeDeclaration,
    TypeDeclaration
} from "@fern-api/ir-sdk";
import { LoggableFernCliError } from "@fern-api/task-context";

type TypesAndServices = Pick<IntermediateRepresentation, "types" | "services">;

export function addExtendedPropertiesToIr(ir: TypesAndServices): TypesAndServices {
    return {
        types: Object.fromEntries(
            Object.entries(ir.types).map(([typeId, typeDeclaration]) => {
                return [typeId, addExtendedPropertiesToType({ typeDeclaration, ir })];
            })
        ),
        services: Object.fromEntries(
            Object.entries(ir.services).map(([serviceId, serviceDeclration]) => {
                return [
                    serviceId,
                    {
                        ...serviceDeclration,
                        endpoints: serviceDeclration.endpoints.map((endpoint) => {
                            return addExtendedPropertiesToEndpoint({ endpoint, ir });
                        })
                    }
                ];
            })
        )
    };
}

function addExtendedPropertiesToEndpoint({
    endpoint,
    ir
}: {
    endpoint: HttpEndpoint;
    ir: TypesAndServices;
}): HttpEndpoint {
    if (endpoint.requestBody?.type !== "inlinedRequestBody") {
        return endpoint;
    }
    return {
        ...endpoint,
        requestBody: {
            ...endpoint.requestBody,
            extendedProperties: endpoint.requestBody.extends.flatMap((extended) =>
                getExtendedPropertiesForDeclaredTypeName(extended, ir)
            )
        }
    };
}

function addExtendedPropertiesToType({
    typeDeclaration,
    ir
}: {
    typeDeclaration: TypeDeclaration;
    ir: TypesAndServices;
}): TypeDeclaration {
    if (typeDeclaration.shape.type !== "object") {
        return typeDeclaration;
    }
    return {
        ...typeDeclaration,
        shape: {
            ...typeDeclaration.shape,
            extendedProperties: typeDeclaration.shape.extends.flatMap((extended) =>
                getExtendedPropertiesForDeclaredTypeName(extended, ir)
            )
        }
    };
}

function getExtendedPropertiesForDeclaredTypeName(
    declaredTypeName: DeclaredTypeName,
    ir: TypesAndServices
): ObjectProperty[] {
    const objectTypeDeclaration = getObjectTypeDeclarationFromTypeId(declaredTypeName.typeId, ir);
    return getAllPropertiesForObject({ objectTypeDeclaration, ir });
}

function getObjectTypeDeclarationFromTypeId(typeId: string, ir: TypesAndServices): ObjectTypeDeclaration {
    const maybeType = ir.types[typeId];
    if (maybeType?.shape.type !== "object") {
        throw new LoggableFernCliError(
            `Unexpected error: ${typeId} is extended but has shape ${maybeType?.shape.type}`
        );
    }
    return maybeType.shape;
}

function getAllPropertiesForObject({
    objectTypeDeclaration,
    ir
}: {
    objectTypeDeclaration: ObjectTypeDeclaration;
    ir: TypesAndServices;
}): ObjectProperty[] {
    const extendedProperties = objectTypeDeclaration.extends.flatMap((extended) => {
        const extendedObjectDeclaration = getObjectTypeDeclarationFromTypeId(extended.typeId, ir);
        return getAllPropertiesForObject({ objectTypeDeclaration: extendedObjectDeclaration, ir });
    });
    return [...objectTypeDeclaration.properties, ...extendedProperties];
}
