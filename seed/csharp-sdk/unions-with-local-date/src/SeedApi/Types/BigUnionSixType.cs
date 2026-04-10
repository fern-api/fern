using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionSixType.BigUnionSixTypeSerializer))]
[Serializable]
public readonly record struct BigUnionSixType : IStringEnum
{
    public static readonly BigUnionSixType PracticalPrinciple = new(Values.PracticalPrinciple);

    public BigUnionSixType(string value)
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
    public static BigUnionSixType FromCustom(string value)
    {
        return new BigUnionSixType(value);
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

    public static bool operator ==(BigUnionSixType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionSixType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionSixType value) => value.Value;

    public static explicit operator BigUnionSixType(string value) => new(value);

    internal class BigUnionSixTypeSerializer : JsonConverter<BigUnionSixType>
    {
        public override BigUnionSixType Read(
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
            return new BigUnionSixType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionSixType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionSixType ReadAsPropertyName(
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
            return new BigUnionSixType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionSixType value,
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
        public const string PracticalPrinciple = "practicalPrinciple";
    }
}
