using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionTwentyTwoType.BigUnionTwentyTwoTypeSerializer))]
[Serializable]
public readonly record struct BigUnionTwentyTwoType : IStringEnum
{
    public static readonly BigUnionTwentyTwoType DiligentDeal = new(Values.DiligentDeal);

    public BigUnionTwentyTwoType(string value)
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
    public static BigUnionTwentyTwoType FromCustom(string value)
    {
        return new BigUnionTwentyTwoType(value);
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

    public static bool operator ==(BigUnionTwentyTwoType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionTwentyTwoType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionTwentyTwoType value) => value.Value;

    public static explicit operator BigUnionTwentyTwoType(string value) => new(value);

    internal class BigUnionTwentyTwoTypeSerializer : JsonConverter<BigUnionTwentyTwoType>
    {
        public override BigUnionTwentyTwoType Read(
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
            return new BigUnionTwentyTwoType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionTwentyTwoType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionTwentyTwoType ReadAsPropertyName(
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
            return new BigUnionTwentyTwoType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionTwentyTwoType value,
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
        public const string DiligentDeal = "diligentDeal";
    }
}
