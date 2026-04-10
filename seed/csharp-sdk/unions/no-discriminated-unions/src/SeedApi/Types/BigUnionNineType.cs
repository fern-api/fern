using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionNineType.BigUnionNineTypeSerializer))]
[Serializable]
public readonly record struct BigUnionNineType : IStringEnum
{
    public static readonly BigUnionNineType ActiveDiamond = new(Values.ActiveDiamond);

    public BigUnionNineType(string value)
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
    public static BigUnionNineType FromCustom(string value)
    {
        return new BigUnionNineType(value);
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

    public static bool operator ==(BigUnionNineType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionNineType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionNineType value) => value.Value;

    public static explicit operator BigUnionNineType(string value) => new(value);

    internal class BigUnionNineTypeSerializer : JsonConverter<BigUnionNineType>
    {
        public override BigUnionNineType Read(
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
            return new BigUnionNineType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionNineType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionNineType ReadAsPropertyName(
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
            return new BigUnionNineType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionNineType value,
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
        public const string ActiveDiamond = "activeDiamond";
    }
}
