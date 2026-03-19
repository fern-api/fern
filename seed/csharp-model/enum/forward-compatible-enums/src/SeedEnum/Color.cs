using System.Text.Json;
using System.Text.Json.Serialization;
using SeedEnum.Core;

namespace SeedEnum;

[JsonConverter(typeof(Color.ColorSerializer))]
[Serializable]
public readonly record struct Color : IStringEnum
{
    public static readonly Color Red = new(Values.Red);

    public static readonly Color Blue = new(Values.Blue);

    public Color(string value)
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
    public static Color FromCustom(string value)
    {
        return new Color(value);
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

    public static bool operator ==(Color value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Color value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(Color value) => value.Value;

    public static explicit operator Color(string value) => new(value);

    internal class ColorSerializer : JsonConverter<Color>
    {
        public override Color Read(
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
            return new Color(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Color value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override Color ReadAsPropertyName(
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
            return new Color(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Color value,
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
        public const string Red = "red";

        public const string Blue = "blue";
    }
}
