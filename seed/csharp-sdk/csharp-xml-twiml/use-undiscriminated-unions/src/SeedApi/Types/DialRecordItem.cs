using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(DialRecordItem.DialRecordItemSerializer))]
[Serializable]
public readonly record struct DialRecordItem : IStringEnum
{
    public static readonly DialRecordItem RecordFromAnswer = new(Values.RecordFromAnswer);

    public static readonly DialRecordItem RecordFromRinging = new(Values.RecordFromRinging);

    public DialRecordItem(string value)
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
    public static DialRecordItem FromCustom(string value)
    {
        return new DialRecordItem(value);
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

    public static bool operator ==(DialRecordItem value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(DialRecordItem value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(DialRecordItem value) => value.Value;

    public static explicit operator DialRecordItem(string value) => new(value);

    internal class DialRecordItemSerializer : JsonConverter<DialRecordItem>
    {
        public override DialRecordItem Read(
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
            return new DialRecordItem(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            DialRecordItem value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override DialRecordItem ReadAsPropertyName(
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
            return new DialRecordItem(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            DialRecordItem value,
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
        public const string RecordFromAnswer = "record-from-answer";

        public const string RecordFromRinging = "record-from-ringing";
    }
}
