import { ContainerType, PrimitiveType, Type, TypeDefinition, TypeReference, WireMessage } from "@fern-api/api";

export function getMockBody(wireMessage: WireMessage, allTypes: TypeDefinition[]): any {
    return getMockBodyFromType(wireMessage.type, allTypes);
}

function getMockBodyFromType(type: Type, allTypes: TypeDefinition[]): any {
    if (type._type === "object") {
        let object = {};
        for (const objectProperty of type.properties) {
            object[objectProperty.key] = getMockBodyFromTypeReference(objectProperty.valueType, allTypes);
        }
        return object;
    } else if (type._type === "alias") {
        return getMockBodyFromTypeReference(type.aliasOf, allTypes);
    } else if (type._type === "enum") {
        if (type.values.length === 0 || type.values[0] == null) {
            return undefined;
        }
        return type.values[0]?.value;
    } else if (type._type === "union") {
        if (type.types.length === 0 || type.types[0] == null) {
            return undefined;
        }
        const unionType = type.types[0];
        const unionValueType = unionType.valueType;
        let union = {};
        union[type.discriminant] = unionType.discriminantValue;
        TypeReference._visit<void>(unionValueType, {
            container: (value) => {
                union[unionType.discriminantValue] = getMockBodyFromTypeReference(
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
                union[unionType.discriminantValue] = getMockBodyFromTypeReference(
                    TypeReference.primitive(value),
                    allTypes
                );
            },
            void: () => {
                union[unionType.discriminantValue] = getMockBodyFromTypeReference(TypeReference.void(), allTypes);
            },
            _unknown: () => {
                throw new Error("Encountered unknown typeReference: " + unionValueType);
            },
        });
        return union;
    }
}

function getMockBodyFromTypeReference(typeReference: TypeReference, allTypes: TypeDefinition[]): any {
    if (typeReference._type === "primitive") {
        return PrimitiveType._visit<any>(typeReference.primitive, {
            integer: () => 0,
            double: () => 0.0,
            string: () => "example",
            boolean: () => true,
            long: () => 10000000,
            _unknown: () => {
                throw new Error("Encountered unknown primtiveType: " + typeReference.primitive);
            },
        });
    } else if (typeReference._type === "void") {
        return {};
    } else if (typeReference._type === "container") {
        return ContainerType._visit<any>(typeReference.container, {
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
        });
    } else if (typeReference._type === "named") {
        const namedType = allTypes.find(
            (val) => val.name.name === typeReference.name && val.name.fernFilepath === typeReference.fernFilepath
        );
        if (namedType === undefined) {
            return undefined;
        }
        return getMockBodyFromType(namedType.shape, allTypes);
    }
}
