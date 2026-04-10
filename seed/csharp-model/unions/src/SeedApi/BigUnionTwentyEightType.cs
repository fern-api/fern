using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionTwentyEightType.BigUnionTwentyEightTypeSerializer))]
[Serializable]
public readonly record struct BigUnionTwentyEightType : IStringEnum
{
    public static readonly BigUnionTwentyEightType GaseousRoad = new(Values.GaseousRoad);

    public BigUnionTwentyEightType(string value)
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
    public static BigUnionTwentyEightType FromCustom(string value)
    {
        return new BigUnionTwentyEightType(value);
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

    public static bool operator ==(BigUnionTwentyEightType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionTwentyEightType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionTwentyEightType value) => value.Value;

    public static explicit operator BigUnionTwentyEightType(string value) => new(value);

    internal class BigUnionTwentyEightTypeSerializer : JsonConverter<BigUnionTwentyEightType>
    {
        public override BigUnionTwentyEightType Read(
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
            return new BigUnionTwentyEightType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionTwentyEightType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionTwentyEightType ReadAsPropertyName(
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
            return new BigUnionTwentyEightType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionTwentyEightType value,
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
        public const string GaseousRoad = "gaseousRoad";
    }
}
