using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(UnionWithMultipleNoPropertiesTwoType.UnionWithMultipleNoPropertiesTwoTypeSerializer)
)]
[Serializable]
public readonly record struct UnionWithMultipleNoPropertiesTwoType : IStringEnum
{
    public static readonly UnionWithMultipleNoPropertiesTwoType Empty2 = new(Values.Empty2);

    public UnionWithMultipleNoPropertiesTwoType(string value)
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
    public static UnionWithMultipleNoPropertiesTwoType FromCustom(string value)
    {
        return new UnionWithMultipleNoPropertiesTwoType(value);
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

    public static bool operator ==(UnionWithMultipleNoPropertiesTwoType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(UnionWithMultipleNoPropertiesTwoType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(UnionWithMultipleNoPropertiesTwoType value) =>
        value.Value;

    public static explicit operator UnionWithMultipleNoPropertiesTwoType(string value) =>
        new(value);

    internal class UnionWithMultipleNoPropertiesTwoTypeSerializer
        : JsonConverter<UnionWithMultipleNoPropertiesTwoType>
    {
        public override UnionWithMultipleNoPropertiesTwoType Read(
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
            return new UnionWithMultipleNoPropertiesTwoType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithMultipleNoPropertiesTwoType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override UnionWithMultipleNoPropertiesTwoType ReadAsPropertyName(
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
            return new UnionWithMultipleNoPropertiesTwoType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithMultipleNoPropertiesTwoType value,
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
        public const string Empty2 = "empty2";
    }
}
