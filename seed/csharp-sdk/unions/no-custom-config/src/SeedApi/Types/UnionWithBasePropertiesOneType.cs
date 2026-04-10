using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithBasePropertiesOneType.UnionWithBasePropertiesOneTypeSerializer))]
[Serializable]
public readonly record struct UnionWithBasePropertiesOneType : IStringEnum
{
    public static readonly UnionWithBasePropertiesOneType String = new(Values.String);

    public UnionWithBasePropertiesOneType(string value)
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
    public static UnionWithBasePropertiesOneType FromCustom(string value)
    {
        return new UnionWithBasePropertiesOneType(value);
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

    public static bool operator ==(UnionWithBasePropertiesOneType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UnionWithBasePropertiesOneType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithBasePropertiesOneType value) => value.Value;

    public static explicit operator UnionWithBasePropertiesOneType(string value) => new(value);

    internal class UnionWithBasePropertiesOneTypeSerializer
        : JsonConverter<UnionWithBasePropertiesOneType>
    {
        public override UnionWithBasePropertiesOneType Read(
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
            return new UnionWithBasePropertiesOneType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithBasePropertiesOneType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithBasePropertiesOneType ReadAsPropertyName(
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
            return new UnionWithBasePropertiesOneType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithBasePropertiesOneType value,
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
        public const string String = "string";
    }
}
