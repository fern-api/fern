using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionEightType.BigUnionEightTypeSerializer))]
[Serializable]
public readonly record struct BigUnionEightType : IStringEnum
{
    public static readonly BigUnionEightType VibrantExcitement = new(Values.VibrantExcitement);

    public BigUnionEightType(string value)
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
    public static BigUnionEightType FromCustom(string value)
    {
        return new BigUnionEightType(value);
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

    public static bool operator ==(BigUnionEightType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionEightType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionEightType value) => value.Value;

    public static explicit operator BigUnionEightType(string value) => new(value);

    internal class BigUnionEightTypeSerializer : JsonConverter<BigUnionEightType>
    {
        public override BigUnionEightType Read(
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
            return new BigUnionEightType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionEightType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionEightType ReadAsPropertyName(
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
            return new BigUnionEightType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionEightType value,
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
        public const string VibrantExcitement = "vibrantExcitement";
    }
}
