using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionSixteenType.BigUnionSixteenTypeSerializer))]
[Serializable]
public readonly record struct BigUnionSixteenType : IStringEnum
{
    public static readonly BigUnionSixteenType GruesomeCoach = new(Values.GruesomeCoach);

    public BigUnionSixteenType(string value)
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
    public static BigUnionSixteenType FromCustom(string value)
    {
        return new BigUnionSixteenType(value);
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

    public static bool operator ==(BigUnionSixteenType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionSixteenType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionSixteenType value) => value.Value;

    public static explicit operator BigUnionSixteenType(string value) => new(value);

    internal class BigUnionSixteenTypeSerializer : JsonConverter<BigUnionSixteenType>
    {
        public override BigUnionSixteenType Read(
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
            return new BigUnionSixteenType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionSixteenType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionSixteenType ReadAsPropertyName(
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
            return new BigUnionSixteenType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionSixteenType value,
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
        public const string GruesomeCoach = "gruesomeCoach";
    }
}
