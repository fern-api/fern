import { FernIr } from "@fern-fern/ir-sdk";
import { rust } from "@fern-api/rust-codegen";
import { ModelGeneratorContext } from "../ModelGeneratorContext.js";
import { generateRustTypeForTypeReference } from "../converters/getRustTypeForTypeReference.js";
import { getInnerTypeFromOptional, isOptionalType, isStringType } from "./primitiveTypeUtils.js";
import { isFieldRecursive } from "./recursiveTypeUtils.js";

export interface BuilderFieldInfo {
    /** Field name in Rust (snake_case, keyword-escaped) */
    name: string;
    /** Rendered builder field type string (always Option-wrapped, deduped via AST) */
    fieldTypeStr: string;
    /** Rendered setter parameter type string (the inner type the caller passes in) */
    setterTypeStr: string;
    /** Whether the field is required (non-optional in the original struct) */
    isRequired: boolean;
    /** Whether the setter should use `impl Into<T>` */
    useImplInto: boolean;
}

/**
 * Renders a rust.Type to its string representation.
 */
function typeToString(type: rust.Type): string {
    const tempWriter = rust.writer();
    type.write(tempWriter);
    return tempWriter.toString().trim();
}

/**
 * Strips all optional/nullable wrappers from a TypeReference,
 * returning the innermost non-optional type.
 */
function unwrapAllOptionals(typeRef: FernIr.TypeReference): FernIr.TypeReference {
    let current = typeRef;
    while (isOptionalType(current)) {
        current = getInnerTypeFromOptional(current);
    }
    return current;
}

/**
 * Collects builder field info from object properties.
 */
export function collectBuilderFieldsFromProperties(
    properties: (FernIr.ObjectProperty | FernIr.InlinedRequestBodyProperty)[],
    context: ModelGeneratorContext,
    typeId?: string
): BuilderFieldInfo[] {
    return properties.map((property) => {
        const isOptional = isOptionalType(property.valueType);

        // Strip all optional/nullable layers to get the bare type.
        // Setters always expose the non-optional type — the Option wrapping
        // is the builder's internal concern.
        const bareTypeRef = unwrapAllOptionals(property.valueType);

        // Determine if this is a recursive field
        const isRecursive = typeId
            ? isFieldRecursive(typeId, property.valueType, context.ir)
            : false;

        // Generate the bare type for the setter parameter
        const bareType = generateRustTypeForTypeReference(bareTypeRef, context, isRecursive);
        const setterTypeStr = typeToString(bareType);

        // Builder field is always Option<BareType>
        const fieldTypeStr = typeToString(rust.Type.option(bareType));

        // Check if the bare type is String for impl Into usage
        const useImplInto = isStringType(bareTypeRef);

        const name = context.escapeRustKeyword(context.case.snakeUnsafe(property.name));

        return {
            name,
            fieldTypeStr,
            setterTypeStr,
            isRequired: !isOptional,
            useImplInto
        };
    });
}

/**
 * Collects builder field info from inherited (extends) types.
 * These are always required fields.
 */
export function collectBuilderFieldsFromExtends(
    extends_: FernIr.DeclaredTypeName[],
    context: ModelGeneratorContext
): BuilderFieldInfo[] {
    return extends_.map((parentType) => {
        const parentTypeName = context.getUniqueTypeNameForReference(parentType);
        const name = `${context.case.snakeUnsafe(parentType.name)}_fields`;

        return {
            name,
            fieldTypeStr: `Option<${parentTypeName}>`,
            setterTypeStr: parentTypeName,
            isRequired: true,
            useImplInto: false
        };
    });
}

/**
 * Writes the complete builder code (impl block with builder() method, builder struct,
 * and builder impl with setters and build()) to the writer.
 */
export function writeBuilderCode(
    writer: rust.Writer,
    structName: string,
    fields: BuilderFieldInfo[],
    options?: { hasExtraProperties?: boolean }
): void {
    const builderName = `${structName}Builder`;

    // impl StructName { pub fn builder() -> StructNameBuilder }
    writer.newLine();
    writer.newLine();
    writer.writeLine(`impl ${structName} {`);
    writer.writeLine(`    pub fn builder() -> ${builderName} {`);
    writer.writeLine(`        <${builderName} as Default>::default()`);
    writer.writeLine(`    }`);
    writer.writeLine(`}`);

    // Builder struct
    writer.newLine();
    writer.writeLine(`#[derive(Clone, PartialEq, Default, Debug)]`);
    writer.writeLine(`#[non_exhaustive]`);
    writer.writeLine(`pub struct ${builderName} {`);
    for (const field of fields) {
        writer.writeLine(`    ${field.name}: ${field.fieldTypeStr},`);
    }
    writer.writeLine(`}`);

    // Builder impl
    writer.newLine();
    writer.writeLine(`impl ${builderName} {`);

    // Setters
    for (let i = 0; i < fields.length; i++) {
        const field = fields[i]!;
        if (i > 0) {
            writer.newLine();
        }
        const paramType = field.useImplInto ? `impl Into<${field.setterTypeStr}>` : field.setterTypeStr;
        const valueExpr = field.useImplInto ? `value.into()` : `value`;
        writer.writeLine(`    pub fn ${field.name}(mut self, value: ${paramType}) -> Self {`);
        writer.writeLine(`        self.${field.name} = Some(${valueExpr});`);
        writer.writeLine(`        self`);
        writer.writeLine(`    }`);
    }

    // build() method
    const requiredFields = fields.filter((f) => f.isRequired);
    writer.newLine();

    // Doc comment
    writer.writeLine(`    /// Consumes the builder and constructs a [\`${structName}\`].`);
    if (requiredFields.length > 0) {
        writer.writeLine(`    /// This method will fail if any of the following fields are not set:`);
        for (const field of requiredFields) {
            writer.writeLine(`    /// - [\`${field.name}\`](${builderName}::${field.name})`);
        }
    }
    writer.writeLine(`    pub fn build(self) -> Result<${structName}, BuildError> {`);
    writer.writeLine(`        Ok(${structName} {`);
    for (const field of fields) {
        if (field.isRequired) {
            writer.writeLine(`            ${field.name}: self.${field.name}.ok_or_else(|| BuildError::missing_field("${field.name}"))?,`);
        } else {
            writer.writeLine(`            ${field.name}: self.${field.name},`);
        }
    }
    if (options?.hasExtraProperties) {
        writer.writeLine(`            extra: Default::default(),`);
    }
    writer.writeLine(`        })`);
    writer.writeLine(`    }`);

    writer.writeLine(`}`);
}
