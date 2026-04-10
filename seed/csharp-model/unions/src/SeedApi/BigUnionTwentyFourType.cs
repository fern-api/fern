using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionTwentyFourType.BigUnionTwentyFourTypeSerializer))]
[Serializable]
public readonly record struct BigUnionTwentyFourType : IStringEnum
{
    public static readonly BigUnionTwentyFourType HoarseMouse = new(Values.HoarseMouse);

    public BigUnionTwentyFourType(string value)
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
    public static BigUnionTwentyFourType FromCustom(string value)
    {
        return new BigUnionTwentyFourType(value);
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

    public static bool operator ==(BigUnionTwentyFourType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionTwentyFourType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionTwentyFourType value) => value.Value;

    public static explicit operator BigUnionTwentyFourType(string value) => new(value);

    internal class BigUnionTwentyFourTypeSerializer : JsonConverter<BigUnionTwentyFourType>
    {
        public override BigUnionTwentyFourType Read(
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
            return new BigUnionTwentyFourType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionTwentyFourType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionTwentyFourType ReadAsPropertyName(
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
            return new BigUnionTwentyFourType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionTwentyFourType value,
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
        public const string HoarseMouse = "hoarseMouse";
    }
}
