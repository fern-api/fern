import { csharp, PrebuiltUtilities } from "@fern-api/csharp-codegen";
import {
    ContainerType,
    DeclaredTypeName,
    Literal,
    MapType,
    PrimitiveType,
    TypeDeclaration,
    TypeId,
    TypeReference
} from "@fern-fern/ir-sdk/api";
import { getNameFromIrName } from "./GeneratorUtilities";

export class ReferenceGenerator {
    private prebuiltUtilities: PrebuiltUtilities;

    private types: Map<TypeId, TypeDeclaration>;
    private references: Map<TypeReference, csharp.Type>;
    public annotations: Map<TypeReference, csharp.Annotation>;

    constructor(types: Map<TypeId, TypeDeclaration>, prebuiltUtilities: PrebuiltUtilities) {
        this.prebuiltUtilities = prebuiltUtilities;
        this.types = types;
        this.references = new Map();
        this.annotations = new Map();

        for (const type of this.types.values()) {
            type.shape;
        }
    }

    public fromDeclaredTypeName(rootModule: string, typeName: DeclaredTypeName): csharp.Type {
        const underlyingType = this.types.get(typeName.typeId);
        if (underlyingType == null) {
            throw new Error(`Type ${typeName.name.pascalCase.safeName} not found`);
        }

        const objectNamespace = csharp.Class.getNamespaceFromFernFilepath(rootModule, typeName.fernFilepath);
        const objectClassReference = new csharp.ClassReference({
            name: getNameFromIrName(typeName.name),
            namespace: objectNamespace
        });
        const objectReference = csharp.Type.reference(objectClassReference);

        return underlyingType.shape._visit({
            alias: (alias) => this.typeFromTypeReference(rootModule, alias.aliasOf),
            object: () => objectReference,
            enum: () => {
                return csharp.Type.stringEnum(objectClassReference);
            },
            union: (union) => {
                // TODO: we could do a better job sharing classreferences between this and the
                // ultimate created class, maybe class should have a classReference as opposed to
                // name and namespace that we then store
                return csharp.Type.oneOf(
                    union.types
                        .map<csharp.Type | undefined>((member) => {
                            const t = member.shape._visit<csharp.ClassReference | undefined>({
                                samePropertiesAsObject: (objectType) =>
                                    new csharp.ClassReference({
                                        name: getNameFromIrName(objectType.name),
                                        namespace: objectNamespace
                                    }),
                                singleProperty: (property) =>
                                    new csharp.ClassReference({
                                        name: getNameFromIrName(property.name.name),
                                        namespace: objectNamespace
                                    }),
                                noProperties: () =>
                                    new csharp.ClassReference({
                                        name: getNameFromIrName(member.discriminantValue.name),
                                        namespace: objectNamespace
                                    }),
                                _other: () => undefined
                            });
                            return t != null ? csharp.Type.reference(t) : undefined;
                        })
                        .filter((c): c is csharp.Type => c !== undefined)
                );
            },
            undiscriminatedUnion: (union) => {
                return csharp.Type.oneOf(
                    union.members.map((member) => this.typeFromTypeReference(rootModule, member.type))
                );
            },
            _other: () => objectReference
        });
    }

    private typeFromContainerReference(rootModule: string, containerType: ContainerType): csharp.Type {
        return containerType._visit<csharp.Type>({
            list: (value: TypeReference) => csharp.Type.list(this.typeFromTypeReference(rootModule, value)),
            map: (value: MapType) =>
                csharp.Type.map(
                    this.typeFromTypeReference(rootModule, value.keyType),
                    this.typeFromTypeReference(rootModule, value.valueType)
                ),
            set: (value: TypeReference) => csharp.Type.set(this.typeFromTypeReference(rootModule, value)),
            optional: (value: TypeReference) => csharp.Type.optional(this.typeFromTypeReference(rootModule, value)),
            literal: (value: Literal) =>
                value._visit<csharp.Type>({
                    string: () => csharp.Type.string(),
                    boolean: () => csharp.Type.boolean(),
                    _other: () => csharp.Type.object()
                }),
            _other: () => csharp.Type.object()
        });
    }

    public typeFromTypeReference(rootModule: string, typeReference: TypeReference): csharp.Type {
        const maybeReference = this.references.get(typeReference);
        if (maybeReference != null) {
            return maybeReference;
        }
        const type = typeReference._visit<csharp.Type>({
            container: (value: ContainerType) => this.typeFromContainerReference(rootModule, value),
            named: (value: DeclaredTypeName) => {
                const underlyingType = this.types.get(value.typeId);
                if (underlyingType == null) {
                    throw new Error(`Type ${value.name.pascalCase.safeName} not found`);
                }

                const objectNamespace = csharp.Class.getNamespaceFromFernFilepath(rootModule, value.fernFilepath);
                const objectClassReference = new csharp.ClassReference({
                    name: getNameFromIrName(value.name),
                    namespace: objectNamespace
                });
                const objectReference = csharp.Type.reference(objectClassReference);

                return underlyingType.shape._visit({
                    alias: (alias) => this.typeFromTypeReference(rootModule, alias.aliasOf),
                    object: () => objectReference,
                    enum: () => {
                        this.annotations.set(typeReference, this.prebuiltUtilities.stringEnumConverterAnnotation());
                        return csharp.Type.stringEnum(objectClassReference);
                    },
                    union: (union) => {
                        const containerObjectName = getNameFromIrName(value.name);
                        this.annotations.set(typeReference, this.prebuiltUtilities.oneOfConverterAnnotation());
                        // TODO: we could do a better job sharing classreferences between this and the
                        // ultimate created class, maybe class should have a classReference as opposed to
                        // name and namespace that we then store
                        return csharp.Type.oneOf(
                            union.types
                                .map<csharp.Type | undefined>((member) => {
                                    const memberObjectName = `${containerObjectName}._${getNameFromIrName(
                                        member.discriminantValue.name
                                    )}`;
                                    const t = member.shape._visit<csharp.ClassReference | undefined>({
                                        samePropertiesAsObject: () =>
                                            new csharp.ClassReference({
                                                name: memberObjectName,
                                                namespace: objectNamespace
                                            }),
                                        singleProperty: () =>
                                            new csharp.ClassReference({
                                                name: memberObjectName,
                                                namespace: objectNamespace
                                            }),
                                        noProperties: () =>
                                            new csharp.ClassReference({
                                                name: memberObjectName,
                                                namespace: objectNamespace
                                            }),
                                        _other: () => undefined
                                    });
                                    return t != null ? csharp.Type.reference(t) : undefined;
                                })
                                .filter((c): c is csharp.Type => c !== undefined)
                        );
                    },
                    undiscriminatedUnion: (union) => {
                        this.annotations.set(typeReference, this.prebuiltUtilities.oneOfConverterAnnotation());
                        return csharp.Type.oneOf(
                            union.members.map((member) => this.typeFromTypeReference(rootModule, member.type))
                        );
                    },
                    _other: () => objectReference
                });
            },
            primitive: (value: PrimitiveType) =>
                PrimitiveType._visit<csharp.Type>(value, {
                    integer: () => csharp.Type.integer(),
                    double: () => csharp.Type.double(),
                    string: () => csharp.Type.string(),
                    boolean: () => csharp.Type.boolean(),
                    long: () => csharp.Type.long(),
                    date: () => csharp.Type.date(),
                    dateTime: () => csharp.Type.dateTime(),
                    uuid: () => csharp.Type.uuid(),
                    // https://learn.microsoft.com/en-us/dotnet/api/system.convert.tobase64string?view=net-8.0
                    base64: () => csharp.Type.string(),
                    _other: () => csharp.Type.object()
                }),
            unknown: () => csharp.Type.object(),
            _other: () => csharp.Type.object()
        });
        this.references.set(typeReference, type);
        return type;
    }
}
