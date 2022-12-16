import { HttpRequestBody } from "@fern-fern/ir-model/services/http";
import {
    ContainerType,
    DeclaredTypeName,
    PrimitiveType,
    SingleUnionTypeProperties,
    SingleUnionTypeProperty,
    Type,
    TypeDeclaration,
    TypeReference,
} from "@fern-fern/ir-model/types";
import { isEqual } from "lodash";

const ISO_DATE = "1994-11-05T13:15:30Z";
const UUID = "3d20db99-b2d9-4643-8f04-13452707b8e8";

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
                dateTime: () => ISO_DATE,
                uuid: () => UUID,
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
                literal: () => {
                    throw new Error("Literals are unsupported!");
                },
            }),
        named: (typeName) => {
            return getMockBodyFromType(getType(typeName, allTypes), allTypes);
        },
        unknown: () => "UNKNOWN",
        _unknown: () => {
            throw new Error("Encountered unknown type reference: " + typeReference._type);
        },
    });
}

function getMockBodyFromType(type: TypeDeclaration, allTypes: TypeDeclaration[]): any {
    if (type.examples[0] != null) {
        return type.examples[0].jsonExample;
    }
    return Type._visit(type.shape, {
        object: (objectDeclaration) => {
            return {
                ...objectDeclaration.properties.reduce<Record<string, any>>(
                    (combined, objectProperty) => ({
                        ...combined,
                        [objectProperty.name.wireValue]: getMockBodyFromTypeReference({
                            typeReference: objectProperty.valueType,
                            allTypes,
                        }),
                    }),
                    {}
                ),
                ...objectDeclaration.extends.reduce<Record<string, any>>(
                    (combined, extension) => ({
                        ...combined,
                        ...getMockBodyFromType(getType(extension, allTypes), allTypes),
                    }),
                    {}
                ),
            };
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

            const discriminantProperties: Record<string, string> = {
                [unionDeclaration.discriminantV3.wireValue]: firstUnionType.discriminantValueV2.wireValue,
            };

            return SingleUnionTypeProperties._visit(firstUnionType.shape, {
                samePropertiesAsObject: (value) => {
                    return {
                        ...discriminantProperties,
                        // TODO this doesn't support named aliases of primitive types
                        ...(getMockBodyFromTypeReference({
                            typeReference: TypeReference.named(value),
                            allTypes,
                        }) as any),
                    };
                },
                singleProperty: (value: SingleUnionTypeProperty) => {
                    return {
                        ...discriminantProperties,
                        [value.nameV2.wireValue]: getMockBodyFromTypeReference({
                            typeReference: value.type,
                            allTypes,
                        }),
                    };
                },
                noProperties: () => {
                    return {
                        ...discriminantProperties,
                    };
                },
                _unknown: () => {
                    throw new Error("Encountered unknown typeReference: " + firstUnionType.valueType._type);
                },
            });
        },
        _unknown: () => {
            throw new Error("Unknown type: " + type.shape._type);
        },
    });
}

function getType(declaredTypeName: DeclaredTypeName, allTypes: TypeDeclaration[]): TypeDeclaration {
    const namedType = allTypes.find(
        (val) =>
            val.name.name === declaredTypeName.name && isEqual(val.name.fernFilepath, declaredTypeName.fernFilepath)
    );
    if (namedType == null) {
        throw new Error("Cannot find type: " + declaredTypeName.name);
    }
    return namedType;
}

export function getMockRequestBody({
    requestBody,
    allTypes,
}: {
    requestBody: HttpRequestBody;
    allTypes: TypeDeclaration[];
}): unknown {
    return HttpRequestBody._visit(requestBody, {
        inlinedRequestBody: (inlinedRequestBody) => ({
            ...inlinedRequestBody.properties.reduce<Record<string, any>>(
                (combined, objectProperty) => ({
                    ...combined,
                    [objectProperty.name.wireValue]: getMockBodyFromTypeReference({
                        typeReference: objectProperty.valueType,
                        allTypes,
                    }),
                }),
                {}
            ),
            ...inlinedRequestBody.extends.reduce<Record<string, any>>(
                (combined, extension) => ({
                    ...combined,
                    ...getMockBodyFromType(getType(extension, allTypes), allTypes),
                }),
                {}
            ),
        }),
        reference: ({ requestBodyType }) => getMockBodyFromTypeReference({ typeReference: requestBodyType, allTypes }),
        _unknown: () => {
            throw new Error("Unknown HttpRequestBody: " + requestBody.type);
        },
    });
}
