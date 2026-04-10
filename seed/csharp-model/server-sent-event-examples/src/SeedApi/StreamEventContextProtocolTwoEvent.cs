using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(StreamEventContextProtocolTwoEvent.StreamEventContextProtocolTwoEventSerializer)
)]
[Serializable]
public readonly record struct StreamEventContextProtocolTwoEvent : IStringEnum
{
    public static readonly StreamEventContextProtocolTwoEvent Event = new(Values.Event);

    public StreamEventContextProtocolTwoEvent(string value)
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
    public static StreamEventContextProtocolTwoEvent FromCustom(string value)
    {
        return new StreamEventContextProtocolTwoEvent(value);
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

    public static bool operator ==(StreamEventContextProtocolTwoEvent value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(StreamEventContextProtocolTwoEvent value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(StreamEventContextProtocolTwoEvent value) => value.Value;

    public static explicit operator StreamEventContextProtocolTwoEvent(string value) => new(value);

    internal class StreamEventContextProtocolTwoEventSerializer
        : JsonConverter<StreamEventContextProtocolTwoEvent>
    {
        public override StreamEventContextProtocolTwoEvent Read(
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
            return new StreamEventContextProtocolTwoEvent(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            StreamEventContextProtocolTwoEvent value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override StreamEventContextProtocolTwoEvent ReadAsPropertyName(
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
            return new StreamEventContextProtocolTwoEvent(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StreamEventContextProtocolTwoEvent value,
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
        public const string Event = "event";
    }
}
