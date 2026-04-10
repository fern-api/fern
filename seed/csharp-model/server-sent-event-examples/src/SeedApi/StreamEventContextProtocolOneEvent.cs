using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(StreamEventContextProtocolOneEvent.StreamEventContextProtocolOneEventSerializer)
)]
[Serializable]
public readonly record struct StreamEventContextProtocolOneEvent : IStringEnum
{
    public static readonly StreamEventContextProtocolOneEvent Error = new(Values.Error);

    public StreamEventContextProtocolOneEvent(string value)
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
    public static StreamEventContextProtocolOneEvent FromCustom(string value)
    {
        return new StreamEventContextProtocolOneEvent(value);
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

    public static bool operator ==(StreamEventContextProtocolOneEvent value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(StreamEventContextProtocolOneEvent value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(StreamEventContextProtocolOneEvent value) => value.Value;

    public static explicit operator StreamEventContextProtocolOneEvent(string value) => new(value);

    internal class StreamEventContextProtocolOneEventSerializer
        : JsonConverter<StreamEventContextProtocolOneEvent>
    {
        public override StreamEventContextProtocolOneEvent Read(
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
            return new StreamEventContextProtocolOneEvent(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            StreamEventContextProtocolOneEvent value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override StreamEventContextProtocolOneEvent ReadAsPropertyName(
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
            return new StreamEventContextProtocolOneEvent(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StreamEventContextProtocolOneEvent value,
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
        public const string Error = "error";
    }
}
