using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(NotificationMethodOneType.NotificationMethodOneTypeSerializer))]
[Serializable]
public readonly record struct NotificationMethodOneType : IStringEnum
{
    public static readonly NotificationMethodOneType Sms = new(Values.Sms);

    public NotificationMethodOneType(string value)
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
    public static NotificationMethodOneType FromCustom(string value)
    {
        return new NotificationMethodOneType(value);
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

    public static bool operator ==(NotificationMethodOneType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(NotificationMethodOneType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(NotificationMethodOneType value) => value.Value;

    public static explicit operator NotificationMethodOneType(string value) => new(value);

    internal class NotificationMethodOneTypeSerializer : JsonConverter<NotificationMethodOneType>
    {
        public override NotificationMethodOneType Read(
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
            return new NotificationMethodOneType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            NotificationMethodOneType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override NotificationMethodOneType ReadAsPropertyName(
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
            return new NotificationMethodOneType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NotificationMethodOneType value,
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
        public const string Sms = "sms";
    }
}
