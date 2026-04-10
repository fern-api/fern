using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(StreamEventOneEvent.StreamEventOneEventSerializer))]
[Serializable]
public readonly record struct StreamEventOneEvent : IStringEnum
{
    public static readonly StreamEventOneEvent Error = new(Values.Error);

    public StreamEventOneEvent(string value)
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
    public static StreamEventOneEvent FromCustom(string value)
    {
        return new StreamEventOneEvent(value);
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

    public static bool operator ==(StreamEventOneEvent value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(StreamEventOneEvent value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(StreamEventOneEvent value) => value.Value;

    public static explicit operator StreamEventOneEvent(string value) => new(value);

    internal class StreamEventOneEventSerializer : JsonConverter<StreamEventOneEvent>
    {
        public override StreamEventOneEvent Read(
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
            return new StreamEventOneEvent(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            StreamEventOneEvent value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override StreamEventOneEvent ReadAsPropertyName(
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
            return new StreamEventOneEvent(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StreamEventOneEvent value,
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
