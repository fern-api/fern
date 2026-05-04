import { File } from "@fern-api/base-generator";
import { CSharpFile } from "@fern-api/csharp-base";
import { ast, Writer } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";

type EnumTypeDeclaration = FernIr.EnumTypeDeclaration;
type ObjectTypeDeclaration = FernIr.ObjectTypeDeclaration;
type TypeDeclaration = FernIr.TypeDeclaration;
type TypeId = FernIr.TypeId;
type UnionTypeDeclaration = FernIr.UnionTypeDeclaration;
type UndiscriminatedUnionTypeDeclaration = FernIr.UndiscriminatedUnionTypeDeclaration;

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
                        const rawStructName = context.case.pascalSafe(typeDeclaration.name.name);
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
 * For objects: generates fields, extension data, and ToString() directly.
 * For enums: generates the enum definition as raw code (Enum AST can't be nested).
 * For unions/undiscriminated unions: uses existing generators to produce the full class,
 *   then extracts and nests it.
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
    return typeDeclaration.shape._visit<ast.Class | undefined>({
        alias: () => undefined,
        enum: (etd: EnumTypeDeclaration) => {
            return generateInlineEnum({ typeDeclaration, enumDeclaration: etd, typesClass, context });
        },
        object: (otd: ObjectTypeDeclaration) => {
            return generateInlineObject({ typeDeclaration, objectDeclaration: otd, typesClass, context });
        },
        union: (utd: UnionTypeDeclaration) => {
            return generateInlineUnion({ typeDeclaration, unionDeclaration: utd, typesClass, context });
        },
        undiscriminatedUnion: (uutd: UndiscriminatedUnionTypeDeclaration) => {
            return generateInlineUndiscriminatedUnion({
                typeDeclaration,
                unionDeclaration: uutd,
                typesClass,
                context
            });
        },
        _other: () => undefined
    });
}

/**
 * Generates an inline object type as a nested record class with full field generation,
 * extension data, and ToString().
 */
function generateInlineObject({
    typeDeclaration,
    objectDeclaration,
    typesClass,
    context
}: {
    typeDeclaration: TypeDeclaration;
    objectDeclaration: ObjectTypeDeclaration;
    typesClass: ast.Class;
    context: ModelGeneratorContext;
}): ast.Class {
    const classReference = context.csharpTypeMapper.convertToClassReference(typeDeclaration);
    const interfaces = [context.generation.extern.System.Text.Json.Serialization.IJsonOnDeserialized];
    if (objectDeclaration.extraProperties) {
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

    const properties = [...objectDeclaration.properties, ...(objectDeclaration.extendedProperties ?? [])];
    generateFields(nestedClass, {
        properties,
        className: classReference.name,
        context
    });

    addExtensionDataAndAdditionalProperties(nestedClass, objectDeclaration, context);
    context.getToStringMethod(nestedClass);

    return nestedClass;
}

/**
 * Generates an inline enum as raw code injected into the Types class.
 * The Enum AST node writes its own namespace declaration and can't be nested
 * as a Class, so we generate the enum body as a CodeBlock instead.
 */
function generateInlineEnum({
    typeDeclaration,
    enumDeclaration,
    typesClass,
    context
}: {
    typeDeclaration: TypeDeclaration;
    enumDeclaration: EnumTypeDeclaration;
    typesClass: ast.Class;
    context: ModelGeneratorContext;
}): ast.Class | undefined {
    if (context.settings.isForwardCompatibleEnumsEnabled) {
        // StringEnumGenerator produces a Class (record struct) which CAN be nested.
        const file = new StringEnumGenerator(context, typeDeclaration, enumDeclaration).generate();
        const clazz = file.clazz;
        if (clazz instanceof ast.Class) {
            typesClass.addNestedClass(clazz);
            return clazz;
        }
        return undefined;
    }

    // Standard EnumGenerator produces an Enum AST node which writes its own namespace
    // and can't be nested. Generate the enum body as raw code.
    const classReference = context.csharpTypeMapper.convertToClassReference(typeDeclaration);
    const enumName = classReference.name;

    typesClass.addRawBodyContent(
        context.csharp.codeblock((writer: Writer) => {
            // Write JsonConverter annotation
            writer.writeLine(`[global::System.Text.Json.Serialization.JsonConverter(typeof(${enumName}Serializer))]`);
            writer.writeLine(`public enum ${enumName}`);
            writer.writeLine("{");
            writer.indent();

            enumDeclaration.values.forEach((member, index) => {
                const resolved = context.case.resolveNameAndWireValue(member.name);
                const wireValue = JSON.stringify(resolved.wireValue);
                writer.writeLine(`[global::System.Runtime.Serialization.EnumMember(Value = ${wireValue})]`);
                writer.write(context.case.pascalSafe(resolved.name));
                if (index < enumDeclaration.values.length - 1) {
                    writer.writeLine(",");
                    writer.newLine();
                }
            });
            writer.writeNewLineIfLastLineNot();
            writer.dedent();
            writer.writeLine("}");
            writer.newLine();

            // Write companion serializer class
            writer.writeLine(
                `internal class ${enumName}Serializer : global::System.Text.Json.Serialization.JsonConverter<${enumName}>`
            );
            writer.writeLine("{");
            writer.indent();

            // string-to-enum dictionary
            writer.writeLine(
                `private static readonly global::System.Collections.Generic.Dictionary<string, ${enumName}> _stringToEnum = new()`
            );
            writer.writeLine("{");
            writer.indent();
            for (const field of enumDeclaration.values) {
                const resolvedField1 = context.case.resolveNameAndWireValue(field.name);
                writer.writeLine(
                    `{ ${JSON.stringify(resolvedField1.wireValue)}, ${enumName}.${context.case.pascalSafe(resolvedField1.name)} },`
                );
            }
            writer.dedent();
            writer.writeLine("};");
            writer.newLine();

            // enum-to-string dictionary
            writer.writeLine(
                `private static readonly global::System.Collections.Generic.Dictionary<${enumName}, string> _enumToString = new()`
            );
            writer.writeLine("{");
            writer.indent();
            for (const field of enumDeclaration.values) {
                const resolvedField2 = context.case.resolveNameAndWireValue(field.name);
                writer.writeLine(
                    `{ ${enumName}.${context.case.pascalSafe(resolvedField2.name)}, ${JSON.stringify(resolvedField2.wireValue)} },`
                );
            }
            writer.dedent();
            writer.writeLine("};");
            writer.newLine();

            // Read method
            writer.writeLine(
                `public override ${enumName} Read(ref global::System.Text.Json.Utf8JsonReader reader, global::System.Type typeToConvert, global::System.Text.Json.JsonSerializerOptions options)`
            );
            writer.writeLine("{");
            writer.indent();
            writer.writeLine(
                `var stringValue = reader.GetString() ?? throw new global::System.Exception("The JSON value could not be read as a string.");`
            );
            writer.writeLine(`return _stringToEnum.TryGetValue(stringValue, out var enumValue) ? enumValue : default;`);
            writer.dedent();
            writer.writeLine("}");
            writer.newLine();

            // Write method
            writer.writeLine(
                `public override void Write(global::System.Text.Json.Utf8JsonWriter writer, ${enumName} value, global::System.Text.Json.JsonSerializerOptions options)`
            );
            writer.writeLine("{");
            writer.indent();
            writer.writeLine(
                `writer.WriteStringValue(_enumToString.TryGetValue(value, out var stringValue) ? stringValue : null);`
            );
            writer.dedent();
            writer.writeLine("}");

            writer.dedent();
            writer.writeLine("}");
        })
    );

    // Enums injected via raw content don't return a Class for recursive nesting
    // (enums don't have child types anyway)
    return undefined;
}

/**
 * Generates an inline discriminated union by delegating to UnionGenerator,
 * extracting the produced Class, and nesting it inside the Types class.
 */
function generateInlineUnion({
    typeDeclaration,
    unionDeclaration,
    typesClass,
    context
}: {
    typeDeclaration: TypeDeclaration;
    unionDeclaration: UnionTypeDeclaration;
    typesClass: ast.Class;
    context: ModelGeneratorContext;
}): ast.Class | undefined {
    if (!context.settings.shouldGeneratedDiscriminatedUnions) {
        return undefined;
    }
    const file = new UnionGenerator(context, typeDeclaration, unionDeclaration).generate();
    const clazz = file.clazz;
    if (clazz instanceof ast.Class) {
        typesClass.addNestedClass(clazz);
        return clazz;
    }
    return undefined;
}

/**
 * Generates an inline undiscriminated union by delegating to UndiscriminatedUnionGenerator,
 * extracting the produced Class, and nesting it inside the Types class.
 */
function generateInlineUndiscriminatedUnion({
    typeDeclaration,
    unionDeclaration,
    typesClass,
    context
}: {
    typeDeclaration: TypeDeclaration;
    unionDeclaration: UndiscriminatedUnionTypeDeclaration;
    typesClass: ast.Class;
    context: ModelGeneratorContext;
}): ast.Class | undefined {
    if (!context.settings.shouldGenerateUndiscriminatedUnions) {
        return undefined;
    }
    const file = new UndiscriminatedUnionGenerator(context, typeDeclaration, unionDeclaration).generate();
    const clazz = file.clazz;
    if (clazz instanceof ast.Class) {
        typesClass.addNestedClass(clazz);
        return clazz;
    }
    return undefined;
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
