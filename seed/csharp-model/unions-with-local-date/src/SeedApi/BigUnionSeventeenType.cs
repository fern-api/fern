using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionSeventeenType.BigUnionSeventeenTypeSerializer))]
[Serializable]
public readonly record struct BigUnionSeventeenType : IStringEnum
{
    public static readonly BigUnionSeventeenType TotalWork = new(Values.TotalWork);

    public BigUnionSeventeenType(string value)
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
    public static BigUnionSeventeenType FromCustom(string value)
    {
        return new BigUnionSeventeenType(value);
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

    public static bool operator ==(BigUnionSeventeenType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionSeventeenType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionSeventeenType value) => value.Value;

    public static explicit operator BigUnionSeventeenType(string value) => new(value);

    internal class BigUnionSeventeenTypeSerializer : JsonConverter<BigUnionSeventeenType>
    {
        public override BigUnionSeventeenType Read(
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
            return new BigUnionSeventeenType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionSeventeenType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionSeventeenType ReadAsPropertyName(
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
            return new BigUnionSeventeenType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionSeventeenType value,
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
        public const string TotalWork = "totalWork";
    }
}
