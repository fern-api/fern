// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(StreamProtocolMixedSchemaResponse.JsonConverter))]
[Serializable]
public record StreamProtocolMixedSchemaResponse
{
    internal StreamProtocolMixedSchemaResponse(string type, object? value)
    {
        Event = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of StreamProtocolMixedSchemaResponse with <see cref="StreamProtocolMixedSchemaResponse.Heartbeat"/>.
    /// </summary>
    public StreamProtocolMixedSchemaResponse(StreamProtocolMixedSchemaResponse.Heartbeat value)
    {
        Event = "heartbeat";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of StreamProtocolMixedSchemaResponse with <see cref="StreamProtocolMixedSchemaResponse.Entity"/>.
    /// </summary>
    public StreamProtocolMixedSchemaResponse(StreamProtocolMixedSchemaResponse.Entity value)
    {
        Event = "entity";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of StreamProtocolMixedSchemaResponse with <see cref="StreamProtocolMixedSchemaResponse.ObjectData"/>.
    /// </summary>
    public StreamProtocolMixedSchemaResponse(StreamProtocolMixedSchemaResponse.ObjectData value)
    {
        Event = "object_data";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("event")]
    public string Event { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    /// <summary>
    /// Returns true if <see cref="Event"/> is "heartbeat"
    /// </summary>
    public bool IsHeartbeat => Event == "heartbeat";

    /// <summary>
    /// Returns true if <see cref="Event"/> is "entity"
    /// </summary>
    public bool IsEntity => Event == "entity";

    /// <summary>
    /// Returns true if <see cref="Event"/> is "object_data"
    /// </summary>
    public bool IsObjectData => Event == "object_data";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.DataContextHeartbeat"/> if <see cref="Event"/> is 'heartbeat', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Event"/> is not 'heartbeat'.</exception>
    public SeedApi.DataContextHeartbeat AsHeartbeat() =>
        IsHeartbeat
            ? (SeedApi.DataContextHeartbeat)Value!
            : throw new global::System.Exception(
                "StreamProtocolMixedSchemaResponse.Event is not 'heartbeat'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.DataContextEntityEvent"/> if <see cref="Event"/> is 'entity', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Event"/> is not 'entity'.</exception>
    public SeedApi.DataContextEntityEvent AsEntity() =>
        IsEntity
            ? (SeedApi.DataContextEntityEvent)Value!
            : throw new global::System.Exception(
                "StreamProtocolMixedSchemaResponse.Event is not 'entity'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.ProtocolObjectEvent"/> if <see cref="Event"/> is 'object_data', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Event"/> is not 'object_data'.</exception>
    public SeedApi.ProtocolObjectEvent AsObjectData() =>
        IsObjectData
            ? (SeedApi.ProtocolObjectEvent)Value!
            : throw new global::System.Exception(
                "StreamProtocolMixedSchemaResponse.Event is not 'object_data'"
            );

    public T Match<T>(
        Func<SeedApi.DataContextHeartbeat, T> onHeartbeat,
        Func<SeedApi.DataContextEntityEvent, T> onEntity,
        Func<SeedApi.ProtocolObjectEvent, T> onObjectData,
        Func<string, object?, T> onUnknown_
    )
    {
        return Event switch
        {
            "heartbeat" => onHeartbeat(AsHeartbeat()),
            "entity" => onEntity(AsEntity()),
            "object_data" => onObjectData(AsObjectData()),
            _ => onUnknown_(Event, Value),
        };
    }

    public void Visit(
        Action<SeedApi.DataContextHeartbeat> onHeartbeat,
        Action<SeedApi.DataContextEntityEvent> onEntity,
        Action<SeedApi.ProtocolObjectEvent> onObjectData,
        Action<string, object?> onUnknown_
    )
    {
        switch (Event)
        {
            case "heartbeat":
                onHeartbeat(AsHeartbeat());
                break;
            case "entity":
                onEntity(AsEntity());
                break;
            case "object_data":
                onObjectData(AsObjectData());
                break;
            default:
                onUnknown_(Event, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.DataContextHeartbeat"/> and returns true if successful.
    /// </summary>
    public bool TryAsHeartbeat(out SeedApi.DataContextHeartbeat? value)
    {
        if (Event == "heartbeat")
        {
            value = (SeedApi.DataContextHeartbeat)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.DataContextEntityEvent"/> and returns true if successful.
    /// </summary>
    public bool TryAsEntity(out SeedApi.DataContextEntityEvent? value)
    {
        if (Event == "entity")
        {
            value = (SeedApi.DataContextEntityEvent)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.ProtocolObjectEvent"/> and returns true if successful.
    /// </summary>
    public bool TryAsObjectData(out SeedApi.ProtocolObjectEvent? value)
    {
        if (Event == "object_data")
        {
            value = (SeedApi.ProtocolObjectEvent)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator StreamProtocolMixedSchemaResponse(
        StreamProtocolMixedSchemaResponse.Heartbeat value
    ) => new(value);

    public static implicit operator StreamProtocolMixedSchemaResponse(
        StreamProtocolMixedSchemaResponse.Entity value
    ) => new(value);

    public static implicit operator StreamProtocolMixedSchemaResponse(
        StreamProtocolMixedSchemaResponse.ObjectData value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<StreamProtocolMixedSchemaResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(StreamProtocolMixedSchemaResponse).IsAssignableFrom(typeToConvert);

        public override StreamProtocolMixedSchemaResponse Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("event", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'event'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'event' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'event' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'event' is null");

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("event");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "heartbeat" => jsonWithoutDiscriminator.Deserialize<SeedApi.DataContextHeartbeat?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.DataContextHeartbeat"),
                "entity" => jsonWithoutDiscriminator.Deserialize<SeedApi.DataContextEntityEvent?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedApi.DataContextEntityEvent"
                    ),
                "object_data" => jsonWithoutDiscriminator.Deserialize<SeedApi.ProtocolObjectEvent?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.ProtocolObjectEvent"),
                _ => json.Deserialize<object?>(options),
            };
            return new StreamProtocolMixedSchemaResponse(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            StreamProtocolMixedSchemaResponse value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Event switch
                {
                    "heartbeat" => JsonSerializer.SerializeToNode(value.Value, options),
                    "entity" => JsonSerializer.SerializeToNode(value.Value, options),
                    "object_data" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["event"] = value.Event;
            json.WriteTo(writer, options);
        }

        public override StreamProtocolMixedSchemaResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new StreamProtocolMixedSchemaResponse(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StreamProtocolMixedSchemaResponse value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Event);
        }
    }

    /// <summary>
    /// Discriminated union type for heartbeat
    /// </summary>
    [Serializable]
    public struct Heartbeat
    {
        public Heartbeat(SeedApi.DataContextHeartbeat value)
        {
            Value = value;
        }

        internal SeedApi.DataContextHeartbeat Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamProtocolMixedSchemaResponse.Heartbeat(
            SeedApi.DataContextHeartbeat value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for entity
    /// </summary>
    [Serializable]
    public struct Entity
    {
        public Entity(SeedApi.DataContextEntityEvent value)
        {
            Value = value;
        }

        internal SeedApi.DataContextEntityEvent Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamProtocolMixedSchemaResponse.Entity(
            SeedApi.DataContextEntityEvent value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for object_data
    /// </summary>
    [Serializable]
    public struct ObjectData
    {
        public ObjectData(SeedApi.ProtocolObjectEvent value)
        {
            Value = value;
        }

        internal SeedApi.ProtocolObjectEvent Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamProtocolMixedSchemaResponse.ObjectData(
            SeedApi.ProtocolObjectEvent value
        ) => new(value);
    }
}
