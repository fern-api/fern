using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionNineteenType.BigUnionNineteenTypeSerializer))]
[Serializable]
public readonly record struct BigUnionNineteenType : IStringEnum
{
    public static readonly BigUnionNineteenType UniqueStress = new(Values.UniqueStress);

    public BigUnionNineteenType(string value)
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
    public static BigUnionNineteenType FromCustom(string value)
    {
        return new BigUnionNineteenType(value);
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

    public static bool operator ==(BigUnionNineteenType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionNineteenType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionNineteenType value) => value.Value;

    public static explicit operator BigUnionNineteenType(string value) => new(value);

    internal class BigUnionNineteenTypeSerializer : JsonConverter<BigUnionNineteenType>
    {
        public override BigUnionNineteenType Read(
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
            return new BigUnionNineteenType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionNineteenType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionNineteenType ReadAsPropertyName(
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
            return new BigUnionNineteenType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionNineteenType value,
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
        public const string UniqueStress = "uniqueStress";
    }
}
