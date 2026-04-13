using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(UnionWithMultipleNoPropertiesOneType.UnionWithMultipleNoPropertiesOneTypeSerializer)
)]
[Serializable]
public readonly record struct UnionWithMultipleNoPropertiesOneType : IStringEnum
{
    public static readonly UnionWithMultipleNoPropertiesOneType Empty1 = new(Values.Empty1);

    public UnionWithMultipleNoPropertiesOneType(string value)
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
    public static UnionWithMultipleNoPropertiesOneType FromCustom(string value)
    {
        return new UnionWithMultipleNoPropertiesOneType(value);
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

    public static bool operator ==(UnionWithMultipleNoPropertiesOneType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UnionWithMultipleNoPropertiesOneType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithMultipleNoPropertiesOneType value) =>
        value.Value;

    public static explicit operator UnionWithMultipleNoPropertiesOneType(string value) =>
        new(value);

    internal class UnionWithMultipleNoPropertiesOneTypeSerializer
        : JsonConverter<UnionWithMultipleNoPropertiesOneType>
    {
        public override UnionWithMultipleNoPropertiesOneType Read(
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
            return new UnionWithMultipleNoPropertiesOneType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithMultipleNoPropertiesOneType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithMultipleNoPropertiesOneType ReadAsPropertyName(
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
            return new UnionWithMultipleNoPropertiesOneType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithMultipleNoPropertiesOneType value,
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
        public const string Empty1 = "empty1";
    }
}
