using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(
    typeof(StreamEventContextProtocolZeroEvent.StreamEventContextProtocolZeroEventSerializer)
)]
[Serializable]
public readonly record struct StreamEventContextProtocolZeroEvent : IStringEnum
{
    public static readonly StreamEventContextProtocolZeroEvent Completion = new(Values.Completion);

    public StreamEventContextProtocolZeroEvent(string value)
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
    public static StreamEventContextProtocolZeroEvent FromCustom(string value)
    {
        return new StreamEventContextProtocolZeroEvent(value);
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

    public static bool operator ==(StreamEventContextProtocolZeroEvent value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(StreamEventContextProtocolZeroEvent value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(StreamEventContextProtocolZeroEvent value) =>
        value.Value;

    public static explicit operator StreamEventContextProtocolZeroEvent(string value) => new(value);

    internal class StreamEventContextProtocolZeroEventSerializer
        : JsonConverter<StreamEventContextProtocolZeroEvent>
    {
        public override StreamEventContextProtocolZeroEvent Read(
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
            return new StreamEventContextProtocolZeroEvent(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            StreamEventContextProtocolZeroEvent value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override StreamEventContextProtocolZeroEvent ReadAsPropertyName(
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
            return new StreamEventContextProtocolZeroEvent(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StreamEventContextProtocolZeroEvent value,
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
        public const string Completion = "completion";
    }
}
