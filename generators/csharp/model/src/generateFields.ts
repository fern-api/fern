import { getWireValue } from "@fern-api/base-generator";
import { ast, Writer } from "@fern-api/csharp-codegen";

import { FernIr } from "@fern-fern/ir-sdk";

type TypeReference = FernIr.TypeReference;
type Literal = FernIr.Literal;

import { generateNestedBoolLiteralBody, generateNestedStringLiteralBody } from "./generateLiteralType.js";
import { ModelGeneratorContext } from "./ModelGeneratorContext.js";

interface TypeInfo {
    isOptional: boolean;
    isNullable: boolean;
}

/**
 * Analyzes a TypeReference to determine if it's optional and/or nullable.
 * - optional: Type is wrapped in Optional<T> container
 * - nullable: Type is wrapped in nullable container OR optional with nullable inner type
 */
function analyzeTypeReference(typeReference: TypeReference, context: ModelGeneratorContext): TypeInfo {
    const result: TypeInfo = {
        isOptional: false,
        isNullable: false
    };

    let current: TypeReference = typeReference;

    // Unwrap containers and aliases to find optional/nullable wrappers
    while (true) {
        if (current.type === "container") {
            const container = current.container;

            if (container.type === "optional") {
                result.isOptional = true;
                current = container.optional;
            } else if (container.type === "nullable") {
                result.isNullable = true;
                // If we have nullable inside optional, keep unwrapping
                // e.g., optional<nullable<string>> -> Optional<string?> with both attributes
                if (result.isOptional) {
                    current = container.nullable;
                } else {
                    // nullable without optional -> just a nullable reference type with [Nullable]
                    current = container.nullable;
                }
            } else if (container.type === "list" || container.type === "set" || container.type === "map") {
                // Collections are not optional/nullable themselves
                break;
            } else if (container.type === "literal") {
                // Literals are not optional/nullable
                break;
            } else {
                break;
            }
        } else if (current.type === "named") {
            // Resolve aliases to their underlying types
            const typeDeclaration = context.model.dereferenceType(current.typeId).typeDeclaration;
            if (typeDeclaration.shape.type === "alias") {
                current = typeDeclaration.shape.aliasOf;
            } else {
                // Not an alias, we're done
                break;
            }
        } else {
            // Primitive, unknown, etc.
            break;
        }
    }

    return result;
}

export function generateFields(
    cls: ast.Class,
    {
        properties,
        className,
        context
    }: {
        properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[];
        className: string;
        context: ModelGeneratorContext;
    }
): ast.Field[] {
    // Collect all property PascalCase names for collision detection when generating
    // nested literal struct names (e.g., {PropertyName}Literal must not collide with
    // another property name).
    const allPropertyPascalNames = new Set(properties.map((p) => context.case.pascalSafe(p.name)));
    return properties.map((property) => generateField(cls, { property, className, context, allPropertyPascalNames }));
}

export function generateField(
    cls: ast.Class,
    {
        property,
        className,
        context,
        jsonProperty = true,
        initializerOverride,
        useRequiredOverride,
        allPropertyPascalNames
    }: {
        property: FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty;
        className: string;
        context: ModelGeneratorContext;
        jsonProperty?: boolean;
        /** Override the default initializer (e.g., for default values) */
        initializerOverride?: ast.CodeBlock;
        /** Override whether the field should be required */
        useRequiredOverride?: boolean;
        /** All property PascalCase names in the parent class, for collision detection */
        allPropertyPascalNames?: Set<string>;
    }
): ast.Field {
    const fieldType = context.csharpTypeMapper.convert({ reference: property.valueType });
    const maybeLiteralInitializer = context.getLiteralInitializerFromTypeReference({
        typeReference: property.valueType
    });

    // Analyze the type to determine if it's optional and/or nullable
    const typeInfo = analyzeTypeReference(property.valueType, context);

    const fieldAttributes = [];
    if (jsonProperty) {
        if ("propertyAccess" in property && property.propertyAccess) {
            fieldAttributes.push(context.createJsonAccessAttribute(property.propertyAccess));
        }

        // Add Optional/Nullable attributes - combine them if both are present (only if feature flag is enabled)
        if (context.generation.settings.enableExplicitNullableOptional) {
            if (typeInfo.isOptional && typeInfo.isNullable) {
                // Both optional and nullable - use annotation group [Nullable, Optional]
                const items = [context.createNullableAttribute(), context.createOptionalAttribute()];
                fieldAttributes.push(context.csharp.annotationGroup({ items }));
            } else if (typeInfo.isOptional) {
                // Only optional
                fieldAttributes.push(context.createOptionalAttribute());
            } else if (typeInfo.isNullable) {
                // Only nullable
                fieldAttributes.push(context.createNullableAttribute());
            }
        }

        fieldAttributes.push(context.createJsonPropertyNameAttribute(getWireValue(property.name)));
    }
    // if we are using readonly constants, we need to generate the accessors and initializer
    // so that deserialization works correctly  (ie, throws deserializing an incorrect value to a readonly constant)

    let accessors: ast.Field.Accessors | undefined;
    let initializer: ast.CodeBlock | undefined = maybeLiteralInitializer;
    let useRequired = true;

    // Read-only properties should not be required since users cannot set them
    if ("propertyAccess" in property && property.propertyAccess === "READ_ONLY") {
        useRequired = false;
    }

    if (context.generation.settings.generateLiterals && maybeLiteralInitializer) {
        // Check if this property references a named literal alias type in the IR.
        // If so, use the struct type from the IR type name instead of string/boolean with Assert.
        const namedLiteralRef = resolveNamedLiteralType(property.valueType, context);
        if (namedLiteralRef != null) {
            // Add [JsonRequired] so that a missing field in JSON throws JsonException
            // instead of silently using the init default.
            fieldAttributes.unshift(
                context.csharp.annotation({
                    reference: context.csharp.classReference({
                        name: "JsonRequiredAttribute",
                        namespace: "System.Text.Json.Serialization"
                    })
                })
            );
            return cls.addField({
                origin: property,
                type: namedLiteralRef,
                access: ast.Access.Public,
                get: true,
                init: true,
                summary: property.docs,
                useRequired: false,
                initializer: context.csharp.codeblock("new()"),
                annotations: fieldAttributes
            });
        }
        // For inline literals (container.literal without a named IR type), generate a nested
        // readonly struct inside the parent record named {PropertyName}Literal.
        const inlineLiteral = extractInlineLiteral(property.valueType);
        if (inlineLiteral != null) {
            const propertyPascalName = context.case.pascalSafe(property.name);
            const structName = computeNestedStructName(propertyPascalName, allPropertyPascalNames ?? new Set());

            // Register the class reference FIRST so the name registry can resolve any conflicts,
            // then use the (possibly renamed) name for the struct creation.
            const nestedStructRef = context.csharp.classReference({
                name: structName,
                enclosingType: cls.reference
            });
            const resolvedStructName = nestedStructRef.name;

            // Build the nested struct inside the parent record using the resolved name
            buildNestedLiteralStruct({
                structName: resolvedStructName,
                literal: inlineLiteral,
                parentClass: cls,
                context
            });

            // Add [JsonRequired] so that a missing field in JSON throws JsonException
            fieldAttributes.unshift(
                context.csharp.annotation({
                    reference: context.csharp.classReference({
                        name: "JsonRequiredAttribute",
                        namespace: "System.Text.Json.Serialization"
                    })
                })
            );

            return cls.addField({
                origin: property,
                type: nestedStructRef,
                access: ast.Access.Public,
                get: true,
                init: true,
                summary: property.docs,
                useRequired: false,
                initializer: context.csharp.codeblock("new()"),
                annotations: fieldAttributes
            });
        }
        // Fallback: keep the existing behavior with get/set accessors and Assert.
        // This handles cases like optional<literal<...>> where the literal is wrapped
        // in a container that neither resolveNamedLiteralType nor extractInlineLiteral matches.
        accessors = {
            get: (writer: Writer) => {
                writer.writeNode(maybeLiteralInitializer);
            },
            set: (writer: Writer) => {
                writer.write("value.Assert(value == ");
                writer.writeNode(maybeLiteralInitializer);
                writer.write(`, string.Format("'${context.case.pascalSafe(property.name)}' must be {0}", `);
                writer.writeNode(maybeLiteralInitializer);
                writer.write("))");
            }
        };
        initializer = undefined;
        useRequired = false;
    }

    // Apply overrides if provided
    if (initializerOverride !== undefined) {
        initializer = initializerOverride;
    }
    if (useRequiredOverride !== undefined) {
        useRequired = useRequiredOverride;
    }

    return cls.addField({
        origin: property,
        type: fieldType,
        access: ast.Access.Public,
        get: true,
        set: true,
        summary: property.docs,
        useRequired,
        initializer,
        annotations: fieldAttributes,
        accessors
    });
}

/**
 * Checks if a TypeReference points to a named literal alias type in the IR.
 * If so, returns a ClassReference for the struct type. Otherwise returns undefined.
 *
 * This handles both direct named references (e.g., `context: SomeLiteral`) and
 * named references that are aliases to literal containers.
 */
function resolveNamedLiteralType(
    typeReference: TypeReference,
    context: ModelGeneratorContext
): ast.ClassReference | undefined {
    if (typeReference.type !== "named") {
        return undefined;
    }
    const { typeId, typeDeclaration } = context.model.dereferenceType(typeReference.typeId);
    if (
        typeDeclaration.shape.type === "alias" &&
        typeDeclaration.shape.resolvedType.type === "container" &&
        typeDeclaration.shape.resolvedType.container.type === "literal"
    ) {
        const structName = context.case.pascalSafe(typeDeclaration.name.name);
        const namespace = context.getNamespaceForTypeId(typeId);
        return context.csharp.classReference({
            name: structName,
            namespace
        });
    }
    return undefined;
}

/**
 * Extracts the IR Literal from an inline literal type reference (container.literal).
 * Returns undefined if the type reference is not an inline literal.
 */
function extractInlineLiteral(typeReference: TypeReference): Literal | undefined {
    if (typeReference.type === "container" && typeReference.container.type === "literal") {
        return typeReference.container.literal;
    }
    return undefined;
}

/**
 * Computes a nested struct name for an inline literal property with collision detection.
 * Naming convention: {PropertyNamePascalCase}Literal
 * If collision detected (another property has the same name), appends numeric suffix.
 */
function computeNestedStructName(propertyPascalName: string, allPropertyPascalNames: Set<string>): string {
    const baseName = `${propertyPascalName}Literal`;
    if (!allPropertyPascalNames.has(baseName)) {
        return baseName;
    }
    // Collision: append numeric suffix
    let suffix = 2;
    while (allPropertyPascalNames.has(`${propertyPascalName}Literal${suffix}`)) {
        suffix++;
    }
    return `${propertyPascalName}Literal${suffix}`;
}

/**
 * Builds a nested readonly struct for an inline literal type inside a parent record.
 * The struct shape is identical to named literal structs: const Value, implicit operator,
 * overrides (ToString, GetHashCode, Equals), equality operators, and a nested JsonConverter.
 *
 * Uses addRawBodyContent on a nested Class to inject pre-formatted struct members.
 */
function buildNestedLiteralStruct({
    structName,
    literal,
    parentClass,
    context
}: {
    structName: string;
    literal: Literal;
    parentClass: ast.Class;
    context: ModelGeneratorContext;
}): void {
    const converterName = `${structName}Converter`;

    // Create the nested struct with [JsonConverter] annotation
    const nestedStruct = parentClass.addNestedClass({
        name: structName,
        access: ast.Access.Public,
        type: ast.Class.ClassType.Struct,
        readonly: true,
        annotations: [
            context.csharp.annotation({
                reference: context.csharp.classReference({
                    name: "JsonConverter",
                    namespace: "System.Text.Json.Serialization"
                }),
                argument: `typeof(${converterName})`
            })
        ]
    });

    // Add namespace references so using declarations appear at the top of the file.
    // Note: System.Type and System.StringComparison are fully qualified with global:: in the
    // raw body content to avoid conflicts with customer-defined types named "Type" or "System".
    nestedStruct.addNamespaceReference("System.Text.Json");
    nestedStruct.addNamespaceReference("System.Text.Json.Serialization");

    // Generate the struct body content using the pre-formatted templates
    const isString = literal.type === "string";
    const isBool = literal.type === "boolean";
    if (!isString && !isBool) {
        throw new Error(`Unsupported literal type for nested struct: ${(literal as Literal).type}`);
    }
    const bodyContent = isString
        ? generateNestedStringLiteralBody({ structName, literalValue: literal.string })
        : generateNestedBoolLiteralBody({ structName, literalValue: literal.boolean });

    // Inject the body content as raw content inside the struct
    nestedStruct.addRawBodyContent(context.csharp.codeblock(bodyContent));
}

export function generateFieldForFileProperty(
    cls: ast.Class,
    {
        property,
        className,
        context
    }: {
        property: FernIr.FileProperty;
        className: string;
        context: ModelGeneratorContext;
    }
): ast.Field {
    const fieldType = context.csharpTypeMapper.convertFromFileProperty({ property });

    return cls.addField({
        origin: context.case.resolveNameAndWireValue(property.key),
        type: fieldType,
        access: ast.Access.Public,
        get: true,
        set: true,
        useRequired: !property.isOptional
    });
}
