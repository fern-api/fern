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
import { csharp } from ".";
import { AbstractCsharpGeneratorContext, BaseCsharpCustomConfigSchema } from "./cli";
import { PrebuiltUtilities } from "./utils";

export class ReferenceGenerator {
    private context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>;
    private prebuiltUtilities: PrebuiltUtilities;

    private types: Record<TypeId, TypeDeclaration>;
    private references: Map<TypeReference, csharp.Type>;
    public annotations: Map<TypeReference, csharp.Annotation>;

    constructor(
        context: AbstractCsharpGeneratorContext<BaseCsharpCustomConfigSchema>,
        prebuiltUtilities: PrebuiltUtilities
    ) {
        this.context = context;
        this.prebuiltUtilities = prebuiltUtilities;
        this.types = this.context.ir.types;
        this.references = new Map();
        this.annotations = new Map();
    }

    public fromDeclaredTypeName(rootModule: string, typeName: DeclaredTypeName): csharp.Type {
        const underlyingType = this.types[typeName.typeId];
        if (underlyingType == null) {
            throw new Error(`Type ${typeName.name.pascalCase.safeName} not found`);
        }

        const objectNamespace = this.context.getNamespaceForTypeId(typeName.typeId);
        const objectClassReference = new csharp.ClassReference({
            name: this.context.getPascalCaseSafeName(typeName.name),
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
                                        name: this.context.getPascalCaseSafeName(objectType.name),
                                        namespace: objectNamespace
                                    }),
                                singleProperty: (property) =>
                                    new csharp.ClassReference({
                                        name: this.context.getPascalCaseSafeName(property.name.name),
                                        namespace: objectNamespace
                                    }),
                                noProperties: () =>
                                    new csharp.ClassReference({
                                        name: this.context.getPascalCaseSafeName(member.discriminantValue.name),
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
                const underlyingType = this.types[value.typeId];
                if (underlyingType == null) {
                    throw new Error(`Type ${value.name.pascalCase.safeName} not found`);
                }

                const objectNamespace = this.context.getNamespaceForTypeId(value.typeId);
                const objectClassReference = new csharp.ClassReference({
                    name: this.context.getPascalCaseSafeName(value.name),
                    namespace: objectNamespace
                });
                const objectReference = csharp.Type.reference(objectClassReference);

                return underlyingType.shape._visit({
                    alias: (alias) => this.typeFromTypeReference(rootModule, alias.aliasOf),
                    object: () => objectReference,
                    enum: () => objectReference,
                    union: (union) => {
                        const containerObjectName = this.context.getPascalCaseSafeName(value.name);
                        this.annotations.set(typeReference, this.prebuiltUtilities.oneOfConverterAnnotation());
                        // TODO: we could do a better job sharing classreferences between this and the
                        // ultimate created class, maybe class should have a classReference as opposed to
                        // name and namespace that we then store
                        return csharp.Type.oneOf(
                            union.types
                                .map<csharp.Type | undefined>((member) => {
                                    const memberObjectName = `${containerObjectName}._${this.context.getPascalCaseSafeName(
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
