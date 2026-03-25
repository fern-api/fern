using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(BasicType.BasicTypeSerializer))]
[Serializable]
public readonly record struct BasicType : IStringEnum
{
    public static readonly BasicType Primitive = new(Values.Primitive);

    public static readonly BasicType Literal = new(Values.Literal);

    public BasicType(string value)
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
    public static BasicType FromCustom(string value)
    {
        return new BasicType(value);
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

    public static bool operator ==(BasicType value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(BasicType value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(BasicType value) => value.Value;

    public static explicit operator BasicType(string value) => new(value);

    internal class BasicTypeSerializer : JsonConverter<BasicType>
    {
        public override BasicType Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new BasicType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BasicType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BasicType ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new BasicType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BasicType value,
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
        public const string Primitive = "primitive";

        public const string Literal = "literal";
    }
}
