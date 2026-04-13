using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(FieldValueTwoType.FieldValueTwoTypeSerializer))]
[Serializable]
public readonly record struct FieldValueTwoType : IStringEnum
{
    public static readonly FieldValueTwoType ContainerValue = new(Values.ContainerValue);

    public FieldValueTwoType(string value)
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
    public static FieldValueTwoType FromCustom(string value)
    {
        return new FieldValueTwoType(value);
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

    public static bool operator ==(FieldValueTwoType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(FieldValueTwoType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(FieldValueTwoType value) => value.Value;

    public static explicit operator FieldValueTwoType(string value) => new(value);

    internal class FieldValueTwoTypeSerializer : JsonConverter<FieldValueTwoType>
    {
        public override FieldValueTwoType Read(
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
            return new FieldValueTwoType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            FieldValueTwoType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override FieldValueTwoType ReadAsPropertyName(
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
            return new FieldValueTwoType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            FieldValueTwoType value,
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
        public const string ContainerValue = "container_value";
    }
}
