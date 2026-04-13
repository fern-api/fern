using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(ExceptionZeroType.ExceptionZeroTypeSerializer))]
[Serializable]
public readonly record struct ExceptionZeroType : IStringEnum
{
    public static readonly ExceptionZeroType Generic = new(Values.Generic);

    public ExceptionZeroType(string value)
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
    public static ExceptionZeroType FromCustom(string value)
    {
        return new ExceptionZeroType(value);
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

    public static bool operator ==(ExceptionZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(ExceptionZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(ExceptionZeroType value) => value.Value;

    public static explicit operator ExceptionZeroType(string value) => new(value);

    internal class ExceptionZeroTypeSerializer : JsonConverter<ExceptionZeroType>
    {
        public override ExceptionZeroType Read(
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
            return new ExceptionZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ExceptionZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override ExceptionZeroType ReadAsPropertyName(
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
            return new ExceptionZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ExceptionZeroType value,
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
        public const string Generic = "generic";
    }
}
