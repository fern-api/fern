using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(ComplexType.ComplexTypeSerializer))]
[Serializable]
public readonly record struct ComplexType : IStringEnum
{
    public static readonly ComplexType Object = new(Values.Object);

    public static readonly ComplexType Union = new(Values.Union);

    public static readonly ComplexType Unknown = new(Values.Unknown);

    public ComplexType(string value)
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
    public static ComplexType FromCustom(string value)
    {
        return new ComplexType(value);
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

    public static bool operator ==(ComplexType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ComplexType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ComplexType value) => value.Value;

    public static explicit operator ComplexType(string value) => new(value);

    internal class ComplexTypeSerializer : JsonConverter<ComplexType>
    {
        public override ComplexType Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new ComplexType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ComplexType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override ComplexType ReadAsPropertyName(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new ComplexType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ComplexType value,
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
        public const string Object = "object";

        public const string Union = "union";

        public const string Unknown = "unknown";
    }
}
