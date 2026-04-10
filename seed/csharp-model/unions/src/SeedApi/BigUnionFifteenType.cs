using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionFifteenType.BigUnionFifteenTypeSerializer))]
[Serializable]
public readonly record struct BigUnionFifteenType : IStringEnum
{
    public static readonly BigUnionFifteenType DisloyalValue = new(Values.DisloyalValue);

    public BigUnionFifteenType(string value)
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
    public static BigUnionFifteenType FromCustom(string value)
    {
        return new BigUnionFifteenType(value);
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

    public static bool operator ==(BigUnionFifteenType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionFifteenType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionFifteenType value) => value.Value;

    public static explicit operator BigUnionFifteenType(string value) => new(value);

    internal class BigUnionFifteenTypeSerializer : JsonConverter<BigUnionFifteenType>
    {
        public override BigUnionFifteenType Read(
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
            return new BigUnionFifteenType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionFifteenType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionFifteenType ReadAsPropertyName(
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
            return new BigUnionFifteenType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionFifteenType value,
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
        public const string DisloyalValue = "disloyalValue";
    }
}
