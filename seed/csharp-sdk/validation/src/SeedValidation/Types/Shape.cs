using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedValidation.Core;

namespace SeedValidation;

[JsonConverter(typeof(Shape.ShapeSerializer))]
[Serializable]
public readonly record struct Shape : IStringEnum
{
    public static readonly Shape Square = new(Values.Square);

    public static readonly Shape Circle = new(Values.Circle);

    public static readonly Shape Triangle = new(Values.Triangle);

    public Shape(string value)
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
    public static Shape FromCustom(string value)
    {
        return new Shape(value);
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

    public static bool operator ==(Shape value1, string value2) => value1.Value.Equals(value2);

    public static bool operator !=(Shape value1, string value2) => !value1.Value.Equals(value2);

    public static explicit operator string(Shape value) => value.Value;

    public static explicit operator Shape(string value) => new(value);

    internal class ShapeSerializer : JsonConverter<Shape>
    {
        public override Shape Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON value could not be read as a string."
                );
            return new Shape(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Shape value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override Shape ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new global::System.Exception(
                    "The JSON property name could not be read as a string."
                );
            return new Shape(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Shape value,
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
        public const string Square = "SQUARE";

        public const string Circle = "CIRCLE";

        public const string Triangle = "TRIANGLE";
    }
}
