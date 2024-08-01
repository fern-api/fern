import {
    DeclaredTypeName,
    HttpEndpoint,
    IntermediateRepresentation,
    ObjectProperty,
    ObjectTypeDeclaration,
    TypeDeclaration
} from "@fern-api/ir-sdk";
import { LoggableFernCliError } from "@fern-api/task-context";

export function addExtendedPrpoertiesToIr(
    ir: Pick<IntermediateRepresentation, "types" | "services">
): Pick<IntermediateRepresentation, "types" | "services"> {
    return {
        types: Object.fromEntries(
            Object.entries(ir.types).map(([typeId, typeDeclaration]) => {
                return [typeId, addExtendedPrpoertiesToType({ typeDeclaration, ir })];
            })
        ),
        services: Object.fromEntries(
            Object.entries(ir.services).map(([serviceId, serviceDeclration]) => {
                return [
                    serviceId,
                    {
                        ...serviceDeclration,
                        endpoints: serviceDeclration.endpoints.map((endpoint) => {
                            return addExtendedPrpoertiesToEndpoint({ endpoint, ir });
                        })
                    }
                ];
            })
        )
    };
}

function addExtendedPrpoertiesToEndpoint({
    endpoint,
    ir
}: {
    endpoint: HttpEndpoint;
    ir: IntermediateRepresentation;
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

function addExtendedPrpoertiesToType({
    typeDeclaration,
    ir
}: {
    typeDeclaration: TypeDeclaration;
    ir: IntermediateRepresentation;
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
    ir: IntermediateRepresentation
): ObjectProperty[] {
    const objectTypeDeclaration = getObjectTypeDeclarationFromTypeId(declaredTypeName.typeId, ir);
    return getAllPropertiesForObject({ objectTypeDeclaration, ir });
}

function getObjectTypeDeclarationFromTypeId(typeId: string, ir: IntermediateRepresentation): ObjectTypeDeclaration {
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
    ir: IntermediateRepresentation;
}): ObjectProperty[] {
    const extendedProperties = objectTypeDeclaration.extends.flatMap((extended) => {
        const extendedObjectDeclaration = getObjectTypeDeclarationFromTypeId(extended.typeId, ir);
        return getAllPropertiesForObject({ objectTypeDeclaration: extendedObjectDeclaration, ir });
    });
    return [...objectTypeDeclaration.properties, ...extendedProperties];
}
