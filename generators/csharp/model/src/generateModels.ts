import { File } from "@fern-api/base-generator";
import { CSharpFile } from "@fern-api/csharp-base";
import { ast } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";

type EnumTypeDeclaration = FernIr.EnumTypeDeclaration;
type ObjectTypeDeclaration = FernIr.ObjectTypeDeclaration;
type TypeDeclaration = FernIr.TypeDeclaration;
type TypeId = FernIr.TypeId;

import { EnumGenerator } from "./enum/EnumGenerator.js";
import { StringEnumGenerator } from "./enum/StringEnumGenerator.js";
import { generateFields } from "./generateFields.js";
import { generateLiteralType } from "./generateLiteralType.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";
import { ObjectGenerator } from "./object/ObjectGenerator.js";
import { UndiscriminatedUnionGenerator } from "./undiscriminated-union/UndiscriminatedUnionGenerator.js";
import { UnionGenerator } from "./union/UnionGenerator.js";

export interface GenerateModelsResult {
    files: CSharpFile[];
    literalTypeFiles: File[];
}

export function generateModels({ context }: { context: ModelGeneratorContext }): GenerateModelsResult {
    const files: CSharpFile[] = [];
    const literalTypeFiles: File[] = [];
    for (const [typeId, typeDeclaration] of Object.entries(context.ir.types)) {
        if (context.protobufResolver.isWellKnownProtobufType(typeId)) {
            // The well-known Protobuf types are generated separately.
            continue;
        }
        if (context.protobufResolver.isExternalProtobufType(typeId)) {
            // External proto types (e.g. google.rpc.Status) are used directly
            // without generating a separate SDK wrapper type.
            continue;
        }
        // When inline types are enabled, skip inline types from top-level generation.
        // They will be nested inside their parent type's Types static class.
        if (context.isInlineType(typeId)) {
            continue;
        }
        const file = typeDeclaration.shape._visit<CSharpFile | undefined>({
            alias: (aliasDeclaration) => {
                // Generate literal struct files for named literal alias types when generateLiterals is on.
                // One file per literal type as defined in the IR. The struct name comes from the IR type name.
                if (context.generation.settings.generateLiterals) {
                    const resolvedType = aliasDeclaration.resolvedType;
                    if (resolvedType.type === "container" && resolvedType.container.type === "literal") {
                        const rawStructName = typeDeclaration.name.name.pascalCase.safeName;
                        const namespace = context.getNamespaceForTypeId(typeId);
                        const directory = context.getDirectoryForTypeId(typeId);
                        // Register the name through the name registry so the raw file uses the
                        // same (possibly collision-resolved) name that ClassReference lookups will.
                        const registeredRef = context.csharp.classReference({
                            name: rawStructName,
                            namespace
                        });
                        const structName = registeredRef.name;
                        literalTypeFiles.push(
                            generateLiteralType({
                                structName,
                                literal: resolvedType.container.literal,
                                namespace: registeredRef.namespace,
                                directory
                            })
                        );
                    }
                }
                return undefined;
            },
            enum: (etd: EnumTypeDeclaration) => {
                return context.settings.isForwardCompatibleEnumsEnabled
                    ? new StringEnumGenerator(context, typeDeclaration, etd).generate()
                    : new EnumGenerator(context, typeDeclaration, etd).generate();
            },
            object: (otd) => {
                return new ObjectGenerator(context, typeDeclaration, otd).generate();
            },
            undiscriminatedUnion: (undiscriminatedUnionDeclaration) => {
                if (context.settings.shouldGenerateUndiscriminatedUnions) {
                    return new UndiscriminatedUnionGenerator(
                        context,
                        typeDeclaration,
                        undiscriminatedUnionDeclaration
                    ).generate();
                }
                return undefined;
            },
            union: (unionDeclaration) => {
                if (context.settings.shouldGeneratedDiscriminatedUnions) {
                    return new UnionGenerator(context, typeDeclaration, unionDeclaration).generate();
                }
                return undefined;
            },
            _other: () => undefined
        });
        if (file != null) {
            // When inline types are enabled, nest inline children inside this type's class
            if (context.settings.enableInlineTypes) {
                const inlineChildren = context.getInlineTypeChildren(typeId);
                if (inlineChildren.size > 0 && file.clazz instanceof ast.Class) {
                    addInlineTypesToClass({
                        parentClass: file.clazz,
                        parentTypeId: typeId,
                        context
                    });
                }
            }
            files.push(file);
        }
    }
    return { files, literalTypeFiles };
}

/**
 * Recursively adds inline child types as nested classes inside a parent type's
 * static `Types` class, following the C# protobuf pattern:
 *   ParentType.Types.InlineChildType
 */
function addInlineTypesToClass({
    parentClass,
    parentTypeId,
    context
}: {
    parentClass: ast.Class;
    parentTypeId: TypeId;
    context: ModelGeneratorContext;
}): void {
    const inlineChildren = context.getInlineTypeChildren(parentTypeId);
    if (inlineChildren.size === 0) {
        return;
    }

    // Create the static `Types` class nested inside the parent.
    // Use collision-aware name (falls back to "InnerTypes" if parent has a "Types" property).
    const typesClassName = context.getInlineTypesClassName(parentTypeId);
    const typesClass = parentClass.addNestedClass({
        name: typesClassName,
        access: ast.Access.Public,
        static_: true,
        enclosingType: parentClass.reference
    });

    // Generate each inline child type as a nested class inside Types
    for (const childTypeId of inlineChildren) {
        const childDeclaration = context.ir.types[childTypeId];
        if (childDeclaration == null) {
            continue;
        }

        const childClass = generateInlineTypeClass({
            typeDeclaration: childDeclaration,
            typesClass,
            context
        });

        if (childClass != null) {
            // Recursively add inline children of this inline type
            const grandChildren = context.getInlineTypeChildren(childTypeId);
            if (grandChildren.size > 0) {
                addInlineTypesToClass({
                    parentClass: childClass,
                    parentTypeId: childTypeId,
                    context
                });
            }
        }
    }
}

/**
 * Generates an inline type as a nested class inside a Types static class.
 * Uses context.csharp.class_() with the ClassReference to propagate the origin,
 * which is required for features like explicit() member naming.
 * Returns the generated class so that recursive nesting can be applied.
 */
function generateInlineTypeClass({
    typeDeclaration,
    typesClass,
    context
}: {
    typeDeclaration: TypeDeclaration;
    typesClass: ast.Class;
    context: ModelGeneratorContext;
}): ast.Class | undefined {
    const classReference = context.csharpTypeMapper.convertToClassReference(typeDeclaration);

    return typeDeclaration.shape._visit<ast.Class | undefined>({
        alias: () => undefined,
        enum: () => {
            // For inline enums, create a nested enum-like class inside the Types class
            const nestedClass = context.csharp.class_({
                reference: classReference,
                access: ast.Access.Public
            });
            typesClass.addNestedClass(nestedClass);
            return nestedClass;
        },
        object: (otd: ObjectTypeDeclaration) => {
            const interfaces = [context.generation.extern.System.Text.Json.Serialization.IJsonOnDeserialized];
            if (otd.extraProperties) {
                interfaces.push(context.generation.extern.System.Text.Json.Serialization.IJsonOnSerializing);
            }

            const nestedClass = context.csharp.class_({
                reference: classReference,
                access: ast.Access.Public,
                type: ast.Class.ClassType.Record,
                interfaceReferences: interfaces,
                annotations: [context.generation.extern.System.Serializable],
                summary: typeDeclaration.docs
            });
            typesClass.addNestedClass(nestedClass);

            // Generate fields for the nested object
            const properties = [...otd.properties, ...(otd.extendedProperties ?? [])];
            generateFields(nestedClass, {
                properties,
                className: classReference.name,
                context
            });

            // Add extension data and additional properties (same pattern as ObjectGenerator)
            addExtensionDataAndAdditionalProperties(nestedClass, otd, context);
            context.getToStringMethod(nestedClass);

            return nestedClass;
        },
        union: () => {
            if (!context.settings.shouldGeneratedDiscriminatedUnions) {
                return undefined;
            }
            const nestedClass = context.csharp.class_({
                reference: classReference,
                access: ast.Access.Public,
                type: ast.Class.ClassType.Record,
                annotations: [context.generation.extern.System.Serializable],
                summary: typeDeclaration.docs
            });
            typesClass.addNestedClass(nestedClass);
            return nestedClass;
        },
        undiscriminatedUnion: () => {
            if (!context.settings.shouldGenerateUndiscriminatedUnions) {
                return undefined;
            }
            const nestedClass = context.csharp.class_({
                reference: classReference,
                access: ast.Access.Public,
                type: ast.Class.ClassType.Class,
                annotations: [context.generation.extern.System.Serializable],
                summary: typeDeclaration.docs
            });
            typesClass.addNestedClass(nestedClass);
            return nestedClass;
        },
        _other: () => undefined
    });
}

/**
 * Adds extension data field and additional properties to a nested inline object class,
 * mirroring the pattern from ObjectGenerator.
 */
function addExtensionDataAndAdditionalProperties(
    class_: ast.Class,
    otd: ObjectTypeDeclaration,
    context: ModelGeneratorContext
): void {
    class_.addField({
        origin: class_.explicit("_extensionData"),
        annotations: [context.generation.extern.System.Text.Json.Serialization.JsonExtensionData],
        access: ast.Access.Private,
        readonly: true,
        type: context.Collection.idictionary(
            context.Primitive.string,
            otd.extraProperties
                ? context.Primitive.object.asOptional()
                : context.generation.extern.System.Text.Json.JsonElement,
            { dontSimplify: true }
        ),
        initializer: otd.extraProperties
            ? context.generation.extern.System.Collections.Generic.Dictionary(
                  context.Primitive.string,
                  context.Primitive.object.asOptional()
              ).new()
            : context.generation.extern.System.Collections.Generic.Dictionary(
                  context.Primitive.string,
                  context.generation.extern.System.Text.Json.JsonElement
              ).new()
    });

    const additionalProperties = class_.addField({
        origin: class_.explicit("AdditionalProperties"),
        annotations: [context.generation.extern.System.Text.Json.Serialization.JsonIgnore],
        access: ast.Access.Public,
        type: otd.extraProperties ? context.Types.AdditionalProperties() : context.Types.ReadOnlyAdditionalProperties(),
        get: true,
        set: otd.extraProperties ? true : ast.Access.Private,
        initializer: context.csharp.codeblock("new()")
    });

    class_.addMethod({
        name: "OnDeserialized",
        interfaceReference: context.generation.extern.System.Text.Json.Serialization.IJsonOnDeserialized,
        parameters: [],
        bodyType: ast.Method.BodyType.Expression,
        body: context.csharp.codeblock(`${additionalProperties.name}.CopyFromExtensionData(_extensionData)`)
    });

    if (otd.extraProperties) {
        class_.addMethod({
            name: "OnSerializing",
            interfaceReference: context.generation.extern.System.Text.Json.Serialization.IJsonOnSerializing,
            parameters: [],
            bodyType: ast.Method.BodyType.Expression,
            body: context.csharp.codeblock(`${additionalProperties.name}.CopyToExtensionData(_extensionData)`)
        });
    }
}
