using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[JsonConverter(typeof(InlineEnum1.InlineEnum1Serializer))]
[Serializable]
public readonly record struct InlineEnum1 : IStringEnum
{
    public static readonly InlineEnum1 Sunny = new(Values.Sunny);

    public static readonly InlineEnum1 Cloudy = new(Values.Cloudy);

    public static readonly InlineEnum1 Raining = new(Values.Raining);

    public static readonly InlineEnum1 Snowing = new(Values.Snowing);

    public InlineEnum1(string value)
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
    public static InlineEnum1 FromCustom(string value)
    {
        return new InlineEnum1(value);
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

    public static bool operator ==(InlineEnum1 value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(InlineEnum1 value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(InlineEnum1 value) => value.Value;

    public static explicit operator InlineEnum1(string value) => new(value);

    internal class InlineEnum1Serializer : JsonConverter<InlineEnum1>
    {
        public override InlineEnum1 Read(
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
            return new InlineEnum1(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            InlineEnum1 value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override InlineEnum1 ReadAsPropertyName(
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
            return new InlineEnum1(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            InlineEnum1 value,
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
        public const string Sunny = "SUNNY";

        public const string Cloudy = "CLOUDY";

        public const string Raining = "RAINING";

        public const string Snowing = "SNOWING";
    }
}
