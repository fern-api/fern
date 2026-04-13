using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionFiveType.BigUnionFiveTypeSerializer))]
[Serializable]
public readonly record struct BigUnionFiveType : IStringEnum
{
    public static readonly BigUnionFiveType DistinctFailure = new(Values.DistinctFailure);

    public BigUnionFiveType(string value)
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
    public static BigUnionFiveType FromCustom(string value)
    {
        return new BigUnionFiveType(value);
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

    public static bool operator ==(BigUnionFiveType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionFiveType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionFiveType value) => value.Value;

    public static explicit operator BigUnionFiveType(string value) => new(value);

    internal class BigUnionFiveTypeSerializer : JsonConverter<BigUnionFiveType>
    {
        public override BigUnionFiveType Read(
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
            return new BigUnionFiveType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionFiveType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionFiveType ReadAsPropertyName(
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
            return new BigUnionFiveType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionFiveType value,
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
        public const string DistinctFailure = "distinctFailure";
    }
}
