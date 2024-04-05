import { csharp, CSharpFile, PrebuiltUtilities } from "@fern-api/csharp-codegen";
import {
    EnumTypeDeclaration,
    ObjectTypeDeclaration,
    Type,
    TypeDeclaration,
    TypeId,
    UnionTypeDeclaration
} from "@fern-fern/ir-sdk/api";
import { EnumGenerator } from "./enum/EnumGenerator";
import { ModelGeneratorContext } from "./ModelGeneratorContext";
import { ObjectGenerator } from "./object/ObjectGenerator";

export class ModelGenerator {
    private rootModule: string;

    private types: Map<TypeId, TypeDeclaration>;
    private context: ModelGeneratorContext;
    private prebuiltUtilities: PrebuiltUtilities;

    constructor(context: ModelGeneratorContext) {
        this.rootModule = context.getNamespace();
        this.context = context;

        this.types = new Map();

        for (const type of Object.values(context.ir.types)) {
            this.types.set(type.name.typeId, type);
        }
        this.prebuiltUtilities = new PrebuiltUtilities(this.rootModule);
    }

    private generateAliasClass(typeId: TypeId): undefined {
        // C# doesn't have a direct equivalent to an alias, so we do not generate a class here.
        // The closest thing to aliases are leveraging a `using` statement, but this seems to be file specific.
        // https://learn.microsoft.com/en-us/dotnet/csharp/language-reference/proposals/csharp-12.0/using-alias-types
        this.context.logger.debug(`Skipping generation of alias type: ${typeId}`);
        return;
    }

    private generateUnionClass(
        typeId: TypeId,
        unionTypeDeclaration: UnionTypeDeclaration,
        typeDeclaration: TypeDeclaration
    ): csharp.Class {
        // For discriminated unions we:
        // 1. Generate a wrapper class that shares the unions name
        // 2. Generate a base interface that contains the properties of the `extends` classes as well as the base properties
        // 3. Generate sub-classes for each member of the union
        // 3a. Each sub-class extends the base class and includes it's discriminant
        // 3b. If a sub-class is also an existing object (`samePropertiesAsObject`), the sub-class will extend that object
        const namespace = this.context.getNamespaceForTypeId(typeId);
        const class_ = csharp.class_({
            name: this.context.getPascalCaseSafeName(typeDeclaration.name.name),
            namespace,
            partial: false,
            access: "public"
        });

        // Generate a base interface that will get extended by the member classes
        const baseProperties = this.context.flattenedProperties.get(typeId) ?? [];
        const baseInterface = csharp.interface_({
            name: "_IBase",
            namespace,
            access: "private",
            partial: false
        });
        let interfaceReferences: csharp.ClassReference[] | undefined = undefined;
        if (baseProperties.length > 0) {
            baseProperties.forEach((property) => {
                const maybeAnnotation = this.context.referenceGenerator.annotations.get(property.valueType);
                baseInterface.addField(
                    csharp.field({
                        name: this.context.getPascalCaseSafeName(property.name.name),
                        type: this.context.referenceGenerator.typeFromTypeReference(
                            this.rootModule,
                            property.valueType
                        ),
                        access: "public",
                        get: true,
                        init: true,
                        jsonPropertyName: property.name.wireValue,
                        annotations: maybeAnnotation ? [maybeAnnotation] : undefined
                    })
                );
            });
            class_.addNestedInterface(baseInterface);
            interfaceReferences = [baseInterface.reference];
        }

        unionTypeDeclaration.types
            .map<csharp.Class | undefined>((member) => {
                const discriminantFieldJsonPropertyName = unionTypeDeclaration.discriminant.wireValue;
                const discriminantField = csharp.field({
                    name: this.context.getPascalCaseSafeName(unionTypeDeclaration.discriminant.name),
                    type: csharp.Types.string(),
                    access: "public",
                    get: true,
                    initializer: new csharp.CodeBlock({ value: `"${member.discriminantValue.wireValue}"` }),
                    init: false,
                    jsonPropertyName: discriminantFieldJsonPropertyName
                });

                return member.shape._visit<csharp.Class | undefined>({
                    samePropertiesAsObject: (objectType) => {
                        const parentClassReference = this.context.referenceGenerator.fromDeclaredTypeName(
                            this.rootModule,
                            objectType
                        );
                        if (parentClassReference == null || parentClassReference.internalType.type !== "reference") {
                            this.context.logger.error(
                                "Could not find reference for object " +
                                    objectType.typeId +
                                    " when generating union: " +
                                    typeId
                            );
                            return;
                        }
                        const nestedClass = csharp.class_({
                            name: `_${this.context.getPascalCaseSafeName(member.discriminantValue.name)}`,
                            namespace,
                            partial: false,
                            access: "public",
                            interfaceReferences,
                            parentClassReference: parentClassReference.internalType.value,
                            isNestedClass: true
                        });
                        nestedClass.addField(discriminantField);

                        return nestedClass;
                    },
                    singleProperty: (property) => {
                        const nestedClass = csharp.class_({
                            name: `_${this.context.getPascalCaseSafeName(member.discriminantValue.name)}`,
                            namespace,
                            partial: false,
                            access: "public",
                            interfaceReferences,
                            isNestedClass: true
                        });
                        nestedClass.addField(discriminantField);

                        const maybeAnnotation = this.context.referenceGenerator.annotations.get(property.type);
                        const singlePropertyField = csharp.field({
                            name: this.context.getPascalCaseSafeName(property.name.name),
                            type: this.context.referenceGenerator.typeFromTypeReference(this.rootModule, property.type),
                            access: "public",
                            get: true,
                            init: true,
                            jsonPropertyName: property.name.wireValue,
                            annotations: maybeAnnotation ? [maybeAnnotation] : undefined
                        });
                        nestedClass.addField(singlePropertyField);
                        return nestedClass;
                    },
                    noProperties: () => {
                        const nestedClass = csharp.class_({
                            name: `_${this.context.getPascalCaseSafeName(member.discriminantValue.name)}`,
                            namespace,
                            partial: false,
                            access: "public",
                            interfaceReferences,
                            isNestedClass: true
                        });
                        nestedClass.addField(discriminantField);

                        return nestedClass;
                    },
                    _other: () => undefined
                });
            })
            .filter((c): c is csharp.Class => c !== undefined)
            .forEach((memberClass) => class_.addNestedClass(memberClass));

        return class_;
    }

    private generateUndiscriminatedUnionClass(typeId: TypeId): undefined {
        // Undiscriminated unions are managed through the use of the OneOf library:
        // OneOf<Type1, Type2, ...>, and so there is no need to generate a class for them,
        // given there are no aliases.
        this.context.logger.debug(
            "Skipping generation of undiscriminated union type, we just annotate unions: " + typeId
        );
        return;
    }

    private generateUnknownClass(shape: Type): undefined {
        this.context.logger.error("Skipping generation of unknown type: " + shape.type);
        return;
    }

    public generateTypes(): CSharpFile[] {
        this.context.logger.debug("Generating all types...");
        const typeFiles: CSharpFile[] = [];
        for (const [typeId, typeDeclaration] of this.types.entries()) {
            const directory = this.context.getDirectoryForTypeId(typeId);
            this.context.logger.debug(`Generating type: ${typeId}`);
            const generatedClass = typeDeclaration.shape._visit<csharp.Class | csharp.Enum | CSharpFile | undefined>({
                alias: () => this.generateAliasClass(typeId),
                enum: (etd: EnumTypeDeclaration) => {
                    return new EnumGenerator(this.context, typeDeclaration, etd).generate();
                },
                object: (otd: ObjectTypeDeclaration) => {
                    return new ObjectGenerator(this.context, typeDeclaration, otd).generate();
                },
                union: (utd: UnionTypeDeclaration) => this.generateUnionClass(typeId, utd, typeDeclaration),
                undiscriminatedUnion: () => this.generateUndiscriminatedUnionClass(typeId),
                _other: () => this.generateUnknownClass(typeDeclaration.shape)
            });

            if (generatedClass instanceof CSharpFile) {
                typeFiles.push(generatedClass);
            } else if (generatedClass != null) {
                typeFiles.push(new CSharpFile({ clazz: generatedClass, directory }));
            }
        }
        return typeFiles;
    }
}
