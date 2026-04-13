using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionSevenType.BigUnionSevenTypeSerializer))]
[Serializable]
public readonly record struct BigUnionSevenType : IStringEnum
{
    public static readonly BigUnionSevenType LimpingStep = new(Values.LimpingStep);

    public BigUnionSevenType(string value)
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
    public static BigUnionSevenType FromCustom(string value)
    {
        return new BigUnionSevenType(value);
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

    public static bool operator ==(BigUnionSevenType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionSevenType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionSevenType value) => value.Value;

    public static explicit operator BigUnionSevenType(string value) => new(value);

    internal class BigUnionSevenTypeSerializer : JsonConverter<BigUnionSevenType>
    {
        public override BigUnionSevenType Read(
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
            return new BigUnionSevenType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionSevenType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionSevenType ReadAsPropertyName(
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
            return new BigUnionSevenType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionSevenType value,
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
        public const string LimpingStep = "limpingStep";
    }
}
