using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(NestedObjectWithLiteralsLiteral1.NestedObjectWithLiteralsLiteral1Serializer))]
[Serializable]
public readonly record struct NestedObjectWithLiteralsLiteral1 : IStringEnum
{
    public static readonly NestedObjectWithLiteralsLiteral1 Literal1 = new(Values.Literal1);

    public NestedObjectWithLiteralsLiteral1(string value)
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
    public static NestedObjectWithLiteralsLiteral1 FromCustom(string value)
    {
        return new NestedObjectWithLiteralsLiteral1(value);
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

    public static bool operator ==(NestedObjectWithLiteralsLiteral1 value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(NestedObjectWithLiteralsLiteral1 value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(NestedObjectWithLiteralsLiteral1 value) => value.Value;

    public static explicit operator NestedObjectWithLiteralsLiteral1(string value) => new(value);

    internal class NestedObjectWithLiteralsLiteral1Serializer
        : JsonConverter<NestedObjectWithLiteralsLiteral1>
    {
        public override NestedObjectWithLiteralsLiteral1 Read(
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
            return new NestedObjectWithLiteralsLiteral1(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedObjectWithLiteralsLiteral1 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override NestedObjectWithLiteralsLiteral1 ReadAsPropertyName(
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
            return new NestedObjectWithLiteralsLiteral1(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NestedObjectWithLiteralsLiteral1 value,
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
        public const string Literal1 = "literal1";
    }
}
