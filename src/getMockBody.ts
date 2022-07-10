import { ContainerType, PrimitiveType, Type, TypeDeclaration, TypeReference } from "@fern-fern/ir-model";
import { isEqual } from "lodash";
import uuid from "uuid";

export function getMockBodyFromTypeReference(typeReference: TypeReference, allTypes: TypeDeclaration[]): any {
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
                list: (value) => [getMockBodyFromTypeReference(value, allTypes)],
                map: (value) => {
                    let result = {};
                    const mockKey = getMockBodyFromTypeReference(value.keyType, allTypes);
                    const mockValue = getMockBodyFromTypeReference(value.valueType, allTypes);
                    result[mockKey] = mockValue;
                    return result;
                },
                set: (value) => [getMockBodyFromTypeReference(value, allTypes)],
                optional: (value) => getMockBodyFromTypeReference(value, allTypes),
                _unknown: () => {
                    throw new Error("Encountered unknown wireMessage: " + typeReference);
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
            let object = {};
            for (const objectProperty of objectDeclaration.properties) {
                object[objectProperty.key] = getMockBodyFromTypeReference(objectProperty.valueType, allTypes);
            }
            return object;
        },
        alias: ({ aliasOf }) => getMockBodyFromTypeReference(aliasOf, allTypes),
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
                    union[firstUnionType.discriminantValue] = getMockBodyFromTypeReference(
                        TypeReference.container(value),
                        allTypes
                    );
                },
                named: (value) => {
                    union = {
                        ...union,
                        ...getMockBodyFromTypeReference(TypeReference.named(value), allTypes),
                    };
                },
                primitive: (value) => {
                    union[firstUnionType.discriminantValue] = getMockBodyFromTypeReference(
                        TypeReference.primitive(value),
                        allTypes
                    );
                },
                void: () => {},
                unknown: () => {},
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
