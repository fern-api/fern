using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionOneType.BigUnionOneTypeSerializer))]
[Serializable]
public readonly record struct BigUnionOneType : IStringEnum
{
    public static readonly BigUnionOneType ThankfulFactor = new(Values.ThankfulFactor);

    public BigUnionOneType(string value)
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
    public static BigUnionOneType FromCustom(string value)
    {
        return new BigUnionOneType(value);
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

    public static bool operator ==(BigUnionOneType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionOneType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionOneType value) => value.Value;

    public static explicit operator BigUnionOneType(string value) => new(value);

    internal class BigUnionOneTypeSerializer : JsonConverter<BigUnionOneType>
    {
        public override BigUnionOneType Read(
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
            return new BigUnionOneType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionOneType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionOneType ReadAsPropertyName(
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
            return new BigUnionOneType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionOneType value,
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
        public const string ThankfulFactor = "thankfulFactor";
    }
}
