using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(BigUnionTwentySevenType.BigUnionTwentySevenTypeSerializer))]
[Serializable]
public readonly record struct BigUnionTwentySevenType : IStringEnum
{
    public static readonly BigUnionTwentySevenType TriangularRepair = new(Values.TriangularRepair);

    public BigUnionTwentySevenType(string value)
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
    public static BigUnionTwentySevenType FromCustom(string value)
    {
        return new BigUnionTwentySevenType(value);
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

    public static bool operator ==(BigUnionTwentySevenType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(BigUnionTwentySevenType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(BigUnionTwentySevenType value) => value.Value;

    public static explicit operator BigUnionTwentySevenType(string value) => new(value);

    internal class BigUnionTwentySevenTypeSerializer : JsonConverter<BigUnionTwentySevenType>
    {
        public override BigUnionTwentySevenType Read(
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
            return new BigUnionTwentySevenType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BigUnionTwentySevenType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override BigUnionTwentySevenType ReadAsPropertyName(
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
            return new BigUnionTwentySevenType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BigUnionTwentySevenType value,
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
        public const string TriangularRepair = "triangularRepair";
    }
}
