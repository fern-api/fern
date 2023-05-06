import { FernRegistry } from "@fern-fern/registry";
import { getAllObjectProperties } from "../../utils/getAllObjectProperties";

export function generateHttpBodyExample(
    type: FernRegistry.HttpBodyShape,
    resolveTypeById: (typeId: FernRegistry.TypeId) => FernRegistry.TypeDefinition
): unknown {
    return type._visit({
        object: (object) => generateExampleObject(object, resolveTypeById),
        reference: (reference) => generateExampleFromTypeReference(reference, resolveTypeById),
        _other: () => null,
    });
}

function generateExampleObject(
    object: FernRegistry.ObjectType,
    resolveTypeById: (typeId: FernRegistry.TypeId) => FernRegistry.TypeDefinition
): Record<string, unknown> {
    const example: Record<string, unknown> = {};
    for (const property of getAllObjectProperties(object, resolveTypeById)) {
        example[property.key] = generateExampleFromTypeReference(property.valueType, resolveTypeById);
    }
    return example;
}

function generateExampleFromId(
    id: FernRegistry.TypeId,
    resolveTypeById: (typeId: FernRegistry.TypeId) => FernRegistry.TypeDefinition
): unknown {
    return resolveTypeById(id).shape._visit<unknown>({
        object: (object) => generateExampleObject(object, resolveTypeById),
        undiscriminatedUnion: ({ members }) => {
            const member = members[0];
            if (member == null) {
                return {};
            }
            return generateExampleFromTypeReference(member.type, resolveTypeById);
        },
        discriminatedUnion: ({ discriminant, members }) => {
            const member = members[0];
            if (member == null) {
                return {};
            }
            return {
                [discriminant]: member.discriminantValue,
                ...generateExampleObject(member.additionalProperties, resolveTypeById),
            };
        },
        alias: (type) => generateExampleFromTypeReference(type, resolveTypeById),
        enum: ({ values }) => values[0]?.value ?? "",
        _other: () => null,
    });
}

function generateExampleFromTypeReference(
    reference: FernRegistry.TypeReference,
    resolveTypeById: (typeId: FernRegistry.TypeId) => FernRegistry.TypeDefinition
): unknown {
    return reference._visit({
        primitive: (primitive) => generateExamplePrimitive(primitive),
        id: (id) => generateExampleFromId(id, resolveTypeById),
        optional: ({ itemType }) => generateExampleFromTypeReference(itemType, resolveTypeById),
        list: ({ itemType }) => [generateExampleFromTypeReference(itemType, resolveTypeById)],
        set: ({ itemType }) => [generateExampleFromTypeReference(itemType, resolveTypeById)],
        map: ({ keyType, valueType }) => ({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            [generateExampleFromTypeReference(keyType, resolveTypeById) as any]: generateExampleFromTypeReference(
                valueType,
                resolveTypeById
            ),
        }),
        unknown: () => ({}),
        _other: () => null,
    });
}

function generateExamplePrimitive(reference: FernRegistry.PrimitiveType): string | number | boolean | null {
    return reference._visit<string | number | boolean | null>({
        string: () => "string",
        integer: () => 0,
        double: () => 1.0,
        boolean: () => true,
        long: () => 99999,
        datetime: () => "2023-01-01T00:00:00Z",
        uuid: () => "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
        _other: () => null,
    });
}
