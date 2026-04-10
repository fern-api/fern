using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(EntityEventPayloadEventType.EntityEventPayloadEventTypeSerializer))]
[Serializable]
public readonly record struct EntityEventPayloadEventType : IStringEnum
{
    public static readonly EntityEventPayloadEventType Created = new(Values.Created);

    public static readonly EntityEventPayloadEventType Updated = new(Values.Updated);

    public static readonly EntityEventPayloadEventType Deleted = new(Values.Deleted);

    public static readonly EntityEventPayloadEventType Preexisting = new(Values.Preexisting);

    public EntityEventPayloadEventType(string value)
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
    public static EntityEventPayloadEventType FromCustom(string value)
    {
        return new EntityEventPayloadEventType(value);
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

    public static bool operator ==(EntityEventPayloadEventType value1, string value2) =>
        value1.Value.Equals(value2);

    public static bool operator !=(EntityEventPayloadEventType value1, string value2) =>
        !value1.Value.Equals(value2);

    public static explicit operator string(EntityEventPayloadEventType value) => value.Value;

    public static explicit operator EntityEventPayloadEventType(string value) => new(value);

    internal class EntityEventPayloadEventTypeSerializer
        : JsonConverter<EntityEventPayloadEventType>
    {
        public override EntityEventPayloadEventType Read(
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
            return new EntityEventPayloadEventType(stringValue);
        }

        public override void Write(
            Utf8JsonWriter writer,
            EntityEventPayloadEventType value,
            JsonSerializerOptions options
        )
        {
            writer.WriteStringValue(value.Value);
        }

        public override EntityEventPayloadEventType ReadAsPropertyName(
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
            return new EntityEventPayloadEventType(stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            EntityEventPayloadEventType value,
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
        public const string Created = "CREATED";

        public const string Updated = "UPDATED";

        public const string Deleted = "DELETED";

        public const string Preexisting = "PREEXISTING";
    }
}
