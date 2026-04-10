using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(NestedObjectWithLiteralsLiteral2.NestedObjectWithLiteralsLiteral2Serializer))]
[Serializable]
public readonly record struct NestedObjectWithLiteralsLiteral2 : IStringEnum
{
    public static readonly NestedObjectWithLiteralsLiteral2 Literal2 = new(Values.Literal2);

    public NestedObjectWithLiteralsLiteral2(string value)
    {
        Value = value;
    }

    /// <summary>
    /// The string value of the enum.
    /// </summary>
    public string Value { get; }

    /// <summary>
    /// Create a string enum with the given value.
    /// </summary>
    public static NestedObjectWithLiteralsLiteral2 FromCustom(string value)
    {
        return new NestedObjectWithLiteralsLiteral2(value);
    }

    public bool Equals(string? other)
    {
        return Value.Equals(other);
    }

    /// <summary>
    /// Returns the string value of the enum.
    /// </summary>
    public override string ToString()
    {
        return Value;
    }

    public static bool operator ==(NestedObjectWithLiteralsLiteral2 value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(NestedObjectWithLiteralsLiteral2 value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(NestedObjectWithLiteralsLiteral2 value) => value.Value;

    public static explicit operator NestedObjectWithLiteralsLiteral2(string value) => new(value);

    internal class NestedObjectWithLiteralsLiteral2Serializer
        : JsonConverter<NestedObjectWithLiteralsLiteral2>
    {
        public override NestedObjectWithLiteralsLiteral2 Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new NestedObjectWithLiteralsLiteral2(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedObjectWithLiteralsLiteral2 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override NestedObjectWithLiteralsLiteral2 ReadAsPropertyName(
            ref Utf8JsonReader reader,
            Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new NestedObjectWithLiteralsLiteral2(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NestedObjectWithLiteralsLiteral2 value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value);
        }
    }

    /// <summary>
    /// Constant strings for enum values
    /// </summary>
    [Serializable]
    public static class Values
    {
        public const string Literal2 = "literal2";
    }
}
