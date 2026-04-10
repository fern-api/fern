using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(FlushedEventType.FlushedEventTypeSerializer))]
[Serializable]
public readonly record struct FlushedEventType : IStringEnum
{
    public static readonly FlushedEventType Flushed = new(Values.Flushed);

    public FlushedEventType(string value)
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
    public static FlushedEventType FromCustom(string value)
    {
        return new FlushedEventType(value);
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

    public static bool operator ==(FlushedEventType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(FlushedEventType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(FlushedEventType value) => value.Value;

    public static explicit operator FlushedEventType(string value) => new(value);

    internal class FlushedEventTypeSerializer : JsonConverter<FlushedEventType>
    {
        public override FlushedEventType Read(
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
            return new FlushedEventType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            FlushedEventType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override FlushedEventType ReadAsPropertyName(
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
            return new FlushedEventType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            FlushedEventType value,
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
        public const string Flushed = "flushed";
    }
}
