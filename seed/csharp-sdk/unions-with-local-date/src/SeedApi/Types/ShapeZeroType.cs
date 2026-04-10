using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(ShapeZeroType.ShapeZeroTypeSerializer))]
[Serializable]
public readonly record struct ShapeZeroType : IStringEnum
{
    public static readonly ShapeZeroType Circle = new(Values.Circle);

    public ShapeZeroType(string value)
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
    public static ShapeZeroType FromCustom(string value)
    {
        return new ShapeZeroType(value);
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

    public static bool operator ==(ShapeZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ShapeZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ShapeZeroType value) => value.Value;

    public static explicit operator ShapeZeroType(string value) => new(value);

    internal class ShapeZeroTypeSerializer : JsonConverter<ShapeZeroType>
    {
        public override ShapeZeroType Read(
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
            return new ShapeZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ShapeZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override ShapeZeroType ReadAsPropertyName(
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
            return new ShapeZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ShapeZeroType value,
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
        public const string Circle = "circle";
    }
}
