using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(NotificationMethodTwoType.NotificationMethodTwoTypeSerializer))]
[Serializable]
public readonly record struct NotificationMethodTwoType : IStringEnum
{
    public static readonly NotificationMethodTwoType Push = new(Values.Push);

    public NotificationMethodTwoType(string value)
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
    public static NotificationMethodTwoType FromCustom(string value)
    {
        return new NotificationMethodTwoType(value);
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

    public static bool operator ==(NotificationMethodTwoType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(NotificationMethodTwoType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(NotificationMethodTwoType value) => value.Value;

    public static explicit operator NotificationMethodTwoType(string value) => new(value);

    internal class NotificationMethodTwoTypeSerializer : JsonConverter<NotificationMethodTwoType>
    {
        public override NotificationMethodTwoType Read(
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
            return new NotificationMethodTwoType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            NotificationMethodTwoType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override NotificationMethodTwoType ReadAsPropertyName(
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
            return new NotificationMethodTwoType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NotificationMethodTwoType value,
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
        public const string Push = "push";
    }
}
