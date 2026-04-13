using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionTwelveType.BigUnionTwelveTypeSerializer))]
[Serializable]
public readonly record struct BigUnionTwelveType : IStringEnum
{
    public static readonly BigUnionTwelveType PrimaryBlock = new(Values.PrimaryBlock);

    public BigUnionTwelveType(string value)
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
    public static BigUnionTwelveType FromCustom(string value)
    {
        return new BigUnionTwelveType(value);
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

    public static bool operator ==(BigUnionTwelveType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionTwelveType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionTwelveType value) => value.Value;

    public static explicit operator BigUnionTwelveType(string value) => new(value);

    internal class BigUnionTwelveTypeSerializer : JsonConverter<BigUnionTwelveType>
    {
        public override BigUnionTwelveType Read(
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
            return new BigUnionTwelveType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionTwelveType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionTwelveType ReadAsPropertyName(
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
            return new BigUnionTwelveType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionTwelveType value,
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
        public const string PrimaryBlock = "primaryBlock";
    }
}
