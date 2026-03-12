import { File } from "@fern-api/base-generator";
import { RelativeFilePath } from "@fern-api/fs-utils";

import { FernIr } from "@fern-fern/ir-sdk";

type Literal = FernIr.Literal;
export type { Literal };

/**
 * Generates a readonly struct file for a literal type defined in the IR.
 *
 * The struct contains:
 * - A const Value field (string or bool)
 * - An implicit operator to the underlying type
 * - ToString(), GetHashCode(), Equals() overrides
 * - == and != operators
 * - An internal sealed JsonConverter class
 */
export function generateLiteralType({
    structName,
    literal,
    namespace,
    directory
}: {
    structName: string;
    literal: Literal;
    namespace: string;
    directory: RelativeFilePath;
}): File {
    let content: string;
    switch (literal.type) {
        case "string":
            content = generateStringLiteralContent({ structName, literalValue: literal.string, namespace });
            break;
        case "boolean":
            content = generateBoolLiteralContent({ structName, literalValue: literal.boolean, namespace });
            break;
        default:
            throw new Error(`Unsupported literal type: ${(literal as Literal).type}`);
    }

    const filename = `${structName}.cs`;
    return new File(filename, directory, content);
}

/**
 * Generates the body of a readonly struct for a string literal type,
 * without namespace or using declarations. Suitable for nesting inside a parent record.
 */
export function generateNestedStringLiteralBody({
    structName,
    literalValue
}: {
    structName: string;
    literalValue: string;
}): string {
    const escapedLiteralValue = literalValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `public const string Value = "${escapedLiteralValue}";

    public static implicit operator string(${structName} _) => Value;
    public override string ToString() => Value;
    public override int GetHashCode() => Value.GetHashCode(global::System.StringComparison.Ordinal);
    public override bool Equals(object? obj) => obj is ${structName};

    public static bool operator ==(${structName} _, ${structName} __) => true;
    public static bool operator !=(${structName} _, ${structName} __) => false;

    internal sealed class ${structName}Converter : JsonConverter<${structName}>
    {
        public override ${structName} Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != ${structName}.Value)
            {
                throw new JsonException(
                    "Expected \\"" + ${structName}.Value + "\\" for type discriminator but got \\"" + value + "\\"."
                );
            }
            return new ${structName}();
        }

        public override void Write(
            Utf8JsonWriter writer,
            ${structName} value,
            JsonSerializerOptions options
        ) => writer.WriteStringValue(${structName}.Value);
    }`;
}

/**
 * Generates the body of a readonly struct for a boolean literal type,
 * without namespace or using declarations. Suitable for nesting inside a parent record.
 */
export function generateNestedBoolLiteralBody({
    structName,
    literalValue
}: {
    structName: string;
    literalValue: boolean;
}): string {
    const csharpValue = literalValue ? "true" : "false";
    const oppositeValue = literalValue ? "false" : "true";
    return `public const bool Value = ${csharpValue};

    public static implicit operator bool(${structName} _) => Value;
    public override string ToString() => Value.ToString();
    public override int GetHashCode() => Value.GetHashCode();
    public override bool Equals(object? obj) => obj is ${structName};

    public static bool operator ==(${structName} _, ${structName} __) => true;
    public static bool operator !=(${structName} _, ${structName} __) => false;

    internal sealed class ${structName}Converter : JsonConverter<${structName}>
    {
        public override ${structName} Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetBoolean();
            if (value != ${structName}.Value)
            {
                throw new JsonException(
                    "Expected ${csharpValue} for type discriminator but got ${oppositeValue}."
                );
            }
            return new ${structName}();
        }

        public override void Write(
            Utf8JsonWriter writer,
            ${structName} value,
            JsonSerializerOptions options
        ) => writer.WriteBooleanValue(${structName}.Value);
    }`;
}

function generateStringLiteralContent({
    structName,
    literalValue,
    namespace
}: {
    structName: string;
    literalValue: string;
    namespace: string;
}): string {
    // Escape backslashes first, then double quotes for C# string literals
    const escapedLiteralValue = literalValue.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
    return `using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace ${namespace};

[JsonConverter(typeof(${structName}Converter))]
public readonly struct ${structName}
{
    public const string Value = "${escapedLiteralValue}";

    public static implicit operator string(${structName} _) => Value;
    public override string ToString() => Value;
    public override int GetHashCode() => Value.GetHashCode(global::System.StringComparison.Ordinal);
    public override bool Equals(object? obj) => obj is ${structName};

    public static bool operator ==(${structName} _, ${structName} __) => true;
    public static bool operator !=(${structName} _, ${structName} __) => false;

    internal sealed class ${structName}Converter : JsonConverter<${structName}>
    {
        public override ${structName} Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetString();
            if (value != ${structName}.Value)
            {
                throw new JsonException(
                    "Expected \\"" + ${structName}.Value + "\\" for type discriminator but got \\"" + value + "\\"."
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
}

function generateBoolLiteralContent({
    structName,
    literalValue,
    namespace
}: {
    structName: string;
    literalValue: boolean;
    namespace: string;
}): string {
    const csharpValue = literalValue ? "true" : "false";
    const oppositeValue = literalValue ? "false" : "true";
    return `using global::System.Text.Json;
using global::System.Text.Json.Serialization;

namespace ${namespace};

[JsonConverter(typeof(${structName}Converter))]
public readonly struct ${structName}
{
    public const bool Value = ${csharpValue};

    public static implicit operator bool(${structName} _) => Value;
    public override string ToString() => Value.ToString();
    public override int GetHashCode() => Value.GetHashCode();
    public override bool Equals(object? obj) => obj is ${structName};

    public static bool operator ==(${structName} _, ${structName} __) => true;
    public static bool operator !=(${structName} _, ${structName} __) => false;

    internal sealed class ${structName}Converter : JsonConverter<${structName}>
    {
        public override ${structName} Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var value = reader.GetBoolean();
            if (value != ${structName}.Value)
            {
                throw new JsonException(
                    "Expected ${csharpValue} for type discriminator but got ${oppositeValue}."
                );
            }
            return new ${structName}();
        }

        public override void Write(
            Utf8JsonWriter writer,
            ${structName} value,
            JsonSerializerOptions options
        ) => writer.WriteBooleanValue(${structName}.Value);
    }
}
`;
}
