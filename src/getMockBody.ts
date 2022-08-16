import { ContainerType, PrimitiveType, Type, TypeDeclaration, TypeReference } from "@fern-fern/ir-model";
import { isEqual, noop } from "lodash";
import uuid from "uuid";

export function getMockBodyFromTypeReference({
    typeReference,
    allTypes,
}: {
    typeReference: TypeReference;
    allTypes: TypeDeclaration[];
}): unknown {
    return TypeReference._visit(typeReference, {
        primitive: (primitive) =>
            PrimitiveType._visit<any>(primitive, {
                integer: () => 0,
                double: () => 0.0,
                string: () => "example",
                boolean: () => true,
                long: () => 10000000,
                dateTime: () => new Date().toISOString(),
                uuid: () => uuid.v4(),
                _unknown: () => {
                    throw new Error("Encountered unknown primtiveType: " + primitive);
                },
            }),
        void: () => undefined,
        container: (container) =>
            ContainerType._visit<any>(container, {
                list: (value) => [getMockBodyFromTypeReference({ typeReference: value, allTypes })],
                map: (value) => {
                    const result: Record<string, unknown> = {};
                    const mockKey = getMockBodyFromTypeReference({ typeReference: value.keyType, allTypes }) as
                        | string
                        | number;
                    const mockValue = getMockBodyFromTypeReference({ typeReference: value.valueType, allTypes });
                    result[mockKey] = mockValue;
                    return result;
                },
                set: (value) => [getMockBodyFromTypeReference({ typeReference: value, allTypes })],
                optional: (value) => getMockBodyFromTypeReference({ typeReference: value, allTypes }),
                _unknown: () => {
                    throw new Error("Encountered unknown wireMessage: " + typeReference._type);
                },
            }),
        named: (typeName) => {
            const namedType = allTypes.find(
                (val) => val.name.name === typeName.name && isEqual(val.name.fernFilepath, typeName.fernFilepath)
            );
            if (namedType === undefined) {
                console.log({ allTypes, typeName });
                throw new Error("Cannot find type: " + typeName.name);
            }
            return getMockBodyFromType(namedType.shape, allTypes);
        },
        unknown: () => "UNKNOWN",
        _unknown: () => {
            throw new Error("Encountered unknown type reference: " + typeReference._type);
        },
    });
}

function getMockBodyFromType(type: Type, allTypes: TypeDeclaration[]): unknown {
    return Type._visit(type, {
        object: (objectDeclaration) => {
            const object = {};
            for (const objectProperty of objectDeclaration.properties) {
                object[objectProperty.name.wireValue] = getMockBodyFromTypeReference({
                    typeReference: objectProperty.valueType,
                    allTypes,
                });
            }
            return object;
        },
        alias: ({ aliasOf }) => getMockBodyFromTypeReference({ typeReference: aliasOf, allTypes }),
        enum: ({ values }) => {
            const firstValue = values[0];
            if (firstValue == null) {
                throw new Error("No values for enum.");
            }
            return firstValue.value;
        },
        union: (unionDeclaration) => {
            const firstUnionType = unionDeclaration.types[0];
            if (firstUnionType == null) {
                throw new Error("No values for union.");
            }

            let union: any = {
                [unionDeclaration.discriminant]: firstUnionType.discriminantValue,
            };

            TypeReference._visit(firstUnionType.valueType, {
                container: (value) => {
                    union[firstUnionType.discriminantValue.wireValue] = getMockBodyFromTypeReference({
                        typeReference: TypeReference.container(value),
                        allTypes,
                    });
                },
                named: (value) => {
                    union = {
                        ...union,
                        // TODO this doesn't support named aliases of primitive types
                        ...(getMockBodyFromTypeReference({
                            typeReference: TypeReference.named(value),
                            allTypes,
                        }) as any),
                    };
                },
                primitive: (value) => {
                    union[firstUnionType.discriminantValue.wireValue] = getMockBodyFromTypeReference({
                        typeReference: TypeReference.primitive(value),
                        allTypes,
                    });
                },
                void: noop,
                unknown: noop,
                _unknown: () => {
                    throw new Error("Encountered unknown typeReference: " + firstUnionType.valueType._type);
                },
            });
            return union;
        },
        _unknown: () => {
            throw new Error("Unknown type: " + type._type);
        },
    });
}
