using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedUnionQueryParameters.Core;

namespace SeedUnionQueryParameters;

[JsonConverter(typeof(EventTypeEnum.EventTypeEnumSerializer))]
[Serializable]
public readonly record struct EventTypeEnum : IStringEnum
{
    public static readonly EventTypeEnum GroupCreated = new(Values.GroupCreated);

    public static readonly EventTypeEnum UserUpdated = new(Values.UserUpdated);

    public EventTypeEnum(string value)
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
    public static EventTypeEnum FromCustom(string value)
    {
        return new EventTypeEnum(value);
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

    public static bool operator ==(EventTypeEnum value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(EventTypeEnum value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(EventTypeEnum value) => value.Value;

    public static explicit operator EventTypeEnum(string value) => new(value);

    internal class EventTypeEnumSerializer : JsonConverter<EventTypeEnum>
    {
        public override EventTypeEnum Read(
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
            return new EventTypeEnum(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            EventTypeEnum value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override EventTypeEnum ReadAsPropertyName(
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
            return new EventTypeEnum(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            EventTypeEnum value,
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
        public const string GroupCreated = "group.created";

        public const string UserUpdated = "user.updated";
    }
}
