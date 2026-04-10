using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(NotificationMethodZeroType.NotificationMethodZeroTypeSerializer))]
[Serializable]
public readonly record struct NotificationMethodZeroType : IStringEnum
{
    public static readonly NotificationMethodZeroType Email = new(Values.Email);

    public NotificationMethodZeroType(string value)
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
    public static NotificationMethodZeroType FromCustom(string value)
    {
        return new NotificationMethodZeroType(value);
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

    public static bool operator ==(NotificationMethodZeroType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(NotificationMethodZeroType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(NotificationMethodZeroType value) => value.Value;

    public static explicit operator NotificationMethodZeroType(string value) => new(value);

    internal class NotificationMethodZeroTypeSerializer : JsonConverter<NotificationMethodZeroType>
    {
        public override NotificationMethodZeroType Read(
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
            return new NotificationMethodZeroType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            NotificationMethodZeroType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override NotificationMethodZeroType ReadAsPropertyName(
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
            return new NotificationMethodZeroType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NotificationMethodZeroType value,
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
        public const string Email = "email";
    }
}
