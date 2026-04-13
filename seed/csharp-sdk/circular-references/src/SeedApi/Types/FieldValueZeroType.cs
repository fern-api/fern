using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(FieldValueZeroType.FieldValueZeroTypeSerializer))]
[Serializable]
public readonly record struct FieldValueZeroType : IStringEnum
{
    public static readonly FieldValueZeroType PrimitiveValue = new(Values.PrimitiveValue);

    public FieldValueZeroType(string value)
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
    public static FieldValueZeroType FromCustom(string value)
    {
        return new FieldValueZeroType(value);
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

    public static bool operator ==(FieldValueZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(FieldValueZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(FieldValueZeroType value) => value.Value;

    public static explicit operator FieldValueZeroType(string value) => new(value);

    internal class FieldValueZeroTypeSerializer : JsonConverter<FieldValueZeroType>
    {
        public override FieldValueZeroType Read(
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
            return new FieldValueZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            FieldValueZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override FieldValueZeroType ReadAsPropertyName(
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
            return new FieldValueZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            FieldValueZeroType value,
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
        public const string PrimitiveValue = "primitive_value";
    }
}
