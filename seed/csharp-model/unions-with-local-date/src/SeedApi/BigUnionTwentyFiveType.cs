using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionTwentyFiveType.BigUnionTwentyFiveTypeSerializer))]
[Serializable]
public readonly record struct BigUnionTwentyFiveType : IStringEnum
{
    public static readonly BigUnionTwentyFiveType CircularCard = new(Values.CircularCard);

    public BigUnionTwentyFiveType(string value)
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
    public static BigUnionTwentyFiveType FromCustom(string value)
    {
        return new BigUnionTwentyFiveType(value);
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

    public static bool operator ==(BigUnionTwentyFiveType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionTwentyFiveType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionTwentyFiveType value) => value.Value;

    public static explicit operator BigUnionTwentyFiveType(string value) => new(value);

    internal class BigUnionTwentyFiveTypeSerializer : JsonConverter<BigUnionTwentyFiveType>
    {
        public override BigUnionTwentyFiveType Read(
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
            return new BigUnionTwentyFiveType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionTwentyFiveType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionTwentyFiveType ReadAsPropertyName(
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
            return new BigUnionTwentyFiveType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionTwentyFiveType value,
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
        public const string CircularCard = "circularCard";
    }
}
