import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";

/**
 * Generates a readonly struct file for a literal string property.
 *
 * The struct contains:
 * - A const string Value field
 * - An implicit operator to string
 * - ToString(), GetHashCode(), Equals() overrides
 * - == and != operators
 * - An internal sealed JsonConverter class
 */
export function generateLiteralType({
    structName,
    literalValue,
    namespace,
    directory
}: {
    structName: string;
    literalValue: string;
    namespace: string;
    directory: RelativeFilePath;
}): File {
    const escapedLiteralValue = literalValue.replace(/"/g, '\\"');
    const content = `using System.Text.Json;
using System.Text.Json.Serialization;

namespace ${namespace};

[JsonConverter(typeof(${structName}Converter))]
public readonly struct ${structName}
{
    public const string Value = "${escapedLiteralValue}";

    public static implicit operator string(${structName} _) => Value;
    public override string ToString() => Value;
    public override int GetHashCode() => Value.GetHashCode(StringComparison.Ordinal);
    public override bool Equals(object? obj) => obj is ${structName};

    public static bool operator ==(${structName} _, ${structName} __) => true;
    public static bool operator !=(${structName} _, ${structName} __) => false;

    internal sealed class ${structName}Converter : JsonConverter<${structName}>
    {
        public override ${structName} Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != ${structName}.Value)
            {
                throw new JsonException(
                    $"Expected \\"${escapedLiteralValue}\\" for type discriminator but got \\"{value}\\"."
                );
            }
            return new ${structName}();
        }

        public override void Write(
            Utf8JsonWriter writer,
            ${structName} value,
            JsonSerializerOptions options
        ) => writer.WriteStringValue(${structName}.Value);
    }
}
`;

    const filename = `${structName}.cs`;
    return new File(filename, directory, content);
}

/**
 * Information about a literal property that needs a struct type generated.
 */
export interface LiteralPropertyInfo {
    /** The name of the struct (e.g., "FlushedEventType") */
    structName: string;
    /** The literal string value (e.g., "flushed") */
    literalValue: string;
    /** The wire name of the property (e.g., "type") */
    wireValue: string;
    /** The property name in PascalCase (e.g., "Type") */
    propertyName: string;
}

/**
 * Gets the struct name for a literal property.
 * Convention: {ParentTypePascalCase}{PropertyNamePascalCase}
 */
export function getLiteralStructName({
    parentTypeName,
    propertyName
}: {
    parentTypeName: string;
    propertyName: string;
}): string {
    return `${parentTypeName}${propertyName}`;
}
