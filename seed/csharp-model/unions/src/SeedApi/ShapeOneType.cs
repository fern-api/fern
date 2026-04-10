using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(ShapeOneType.ShapeOneTypeSerializer))]
[Serializable]
public readonly record struct ShapeOneType : IStringEnum
{
    public static readonly ShapeOneType Square = new(Values.Square);

    public ShapeOneType(string value)
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
    public static ShapeOneType FromCustom(string value)
    {
        return new ShapeOneType(value);
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

    public static bool operator ==(ShapeOneType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ShapeOneType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ShapeOneType value) => value.Value;

    public static explicit operator ShapeOneType(string value) => new(value);

    internal class ShapeOneTypeSerializer : JsonConverter<ShapeOneType>
    {
        public override ShapeOneType Read(
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
            return new ShapeOneType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ShapeOneType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override ShapeOneType ReadAsPropertyName(
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
            return new ShapeOneType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ShapeOneType value,
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
        public const string Square = "square";
    }
}
