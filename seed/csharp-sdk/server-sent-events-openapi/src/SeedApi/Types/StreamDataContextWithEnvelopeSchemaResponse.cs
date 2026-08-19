// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(StreamDataContextWithEnvelopeSchemaResponse.JsonConverter))]
[Serializable]
public record StreamDataContextWithEnvelopeSchemaResponse
{
    internal StreamDataContextWithEnvelopeSchemaResponse(string type, object? value)
    {
        Event = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of StreamDataContextWithEnvelopeSchemaResponse with <see cref="StreamDataContextWithEnvelopeSchemaResponse.Heartbeat"/>.
    /// </summary>
    public StreamDataContextWithEnvelopeSchemaResponse(
        StreamDataContextWithEnvelopeSchemaResponse.Heartbeat value
    )
    {
        Event = "heartbeat";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of StreamDataContextWithEnvelopeSchemaResponse with <see cref="StreamDataContextWithEnvelopeSchemaResponse.StringData"/>.
    /// </summary>
    public StreamDataContextWithEnvelopeSchemaResponse(
        StreamDataContextWithEnvelopeSchemaResponse.StringData value
    )
    {
        Event = "string_data";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of StreamDataContextWithEnvelopeSchemaResponse with <see cref="StreamDataContextWithEnvelopeSchemaResponse.NumberData"/>.
    /// </summary>
    public StreamDataContextWithEnvelopeSchemaResponse(
        StreamDataContextWithEnvelopeSchemaResponse.NumberData value
    )
    {
        Event = "number_data";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of StreamDataContextWithEnvelopeSchemaResponse with <see cref="StreamDataContextWithEnvelopeSchemaResponse.ObjectData"/>.
    /// </summary>
    public StreamDataContextWithEnvelopeSchemaResponse(
        StreamDataContextWithEnvelopeSchemaResponse.ObjectData value
    )
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
    /// Returns true if <see cref="Event"/> is "string_data"
    /// </summary>
    public bool IsStringData => Event == "string_data";

    /// <summary>
    /// Returns true if <see cref="Event"/> is "number_data"
    /// </summary>
    public bool IsNumberData => Event == "number_data";

    /// <summary>
    /// Returns true if <see cref="Event"/> is "object_data"
    /// </summary>
    public bool IsObjectData => Event == "object_data";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.ProtocolHeartbeat"/> if <see cref="Event"/> is 'heartbeat', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Event"/> is not 'heartbeat'.</exception>
    public SeedApi.ProtocolHeartbeat AsHeartbeat() =>
        IsHeartbeat
            ? (SeedApi.ProtocolHeartbeat)Value!
            : throw new global::System.Exception(
                "StreamDataContextWithEnvelopeSchemaResponse.Event is not 'heartbeat'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.ProtocolStringEvent"/> if <see cref="Event"/> is 'string_data', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Event"/> is not 'string_data'.</exception>
    public SeedApi.ProtocolStringEvent AsStringData() =>
        IsStringData
            ? (SeedApi.ProtocolStringEvent)Value!
            : throw new global::System.Exception(
                "StreamDataContextWithEnvelopeSchemaResponse.Event is not 'string_data'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.ProtocolNumberEvent"/> if <see cref="Event"/> is 'number_data', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Event"/> is not 'number_data'.</exception>
    public SeedApi.ProtocolNumberEvent AsNumberData() =>
        IsNumberData
            ? (SeedApi.ProtocolNumberEvent)Value!
            : throw new global::System.Exception(
                "StreamDataContextWithEnvelopeSchemaResponse.Event is not 'number_data'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.ProtocolObjectEvent"/> if <see cref="Event"/> is 'object_data', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Event"/> is not 'object_data'.</exception>
    public SeedApi.ProtocolObjectEvent AsObjectData() =>
        IsObjectData
            ? (SeedApi.ProtocolObjectEvent)Value!
            : throw new global::System.Exception(
                "StreamDataContextWithEnvelopeSchemaResponse.Event is not 'object_data'"
            );

    public T Match<T>(
        Func<SeedApi.ProtocolHeartbeat, T> onHeartbeat,
        Func<SeedApi.ProtocolStringEvent, T> onStringData,
        Func<SeedApi.ProtocolNumberEvent, T> onNumberData,
        Func<SeedApi.ProtocolObjectEvent, T> onObjectData,
        Func<string, object?, T> onUnknown_
    )
    {
        return Event switch
        {
            "heartbeat" => onHeartbeat(AsHeartbeat()),
            "string_data" => onStringData(AsStringData()),
            "number_data" => onNumberData(AsNumberData()),
            "object_data" => onObjectData(AsObjectData()),
            _ => onUnknown_(Event, Value),
        };
    }

    public void Visit(
        Action<SeedApi.ProtocolHeartbeat> onHeartbeat,
        Action<SeedApi.ProtocolStringEvent> onStringData,
        Action<SeedApi.ProtocolNumberEvent> onNumberData,
        Action<SeedApi.ProtocolObjectEvent> onObjectData,
        Action<string, object?> onUnknown_
    )
    {
        switch (Event)
        {
            case "heartbeat":
                onHeartbeat(AsHeartbeat());
                break;
            case "string_data":
                onStringData(AsStringData());
                break;
            case "number_data":
                onNumberData(AsNumberData());
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
    /// Attempts to cast the value to a <see cref="SeedApi.ProtocolHeartbeat"/> and returns true if successful.
    /// </summary>
    public bool TryAsHeartbeat(out SeedApi.ProtocolHeartbeat? value)
    {
        if (Event == "heartbeat")
        {
            value = (SeedApi.ProtocolHeartbeat)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.ProtocolStringEvent"/> and returns true if successful.
    /// </summary>
    public bool TryAsStringData(out SeedApi.ProtocolStringEvent? value)
    {
        if (Event == "string_data")
        {
            value = (SeedApi.ProtocolStringEvent)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.ProtocolNumberEvent"/> and returns true if successful.
    /// </summary>
    public bool TryAsNumberData(out SeedApi.ProtocolNumberEvent? value)
    {
        if (Event == "number_data")
        {
            value = (SeedApi.ProtocolNumberEvent)Value!;
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

    public static implicit operator StreamDataContextWithEnvelopeSchemaResponse(
        StreamDataContextWithEnvelopeSchemaResponse.Heartbeat value
    ) => new(value);

    public static implicit operator StreamDataContextWithEnvelopeSchemaResponse(
        StreamDataContextWithEnvelopeSchemaResponse.StringData value
    ) => new(value);

    public static implicit operator StreamDataContextWithEnvelopeSchemaResponse(
        StreamDataContextWithEnvelopeSchemaResponse.NumberData value
    ) => new(value);

    public static implicit operator StreamDataContextWithEnvelopeSchemaResponse(
        StreamDataContextWithEnvelopeSchemaResponse.ObjectData value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<StreamDataContextWithEnvelopeSchemaResponse>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(StreamDataContextWithEnvelopeSchemaResponse).IsAssignableFrom(typeToConvert);

        public override StreamDataContextWithEnvelopeSchemaResponse Read(
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
                "heartbeat" => jsonWithoutDiscriminator.Deserialize<SeedApi.ProtocolHeartbeat?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.ProtocolHeartbeat"),
                "string_data" => jsonWithoutDiscriminator.Deserialize<SeedApi.ProtocolStringEvent?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.ProtocolStringEvent"),
                "number_data" => jsonWithoutDiscriminator.Deserialize<SeedApi.ProtocolNumberEvent?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.ProtocolNumberEvent"),
                "object_data" => jsonWithoutDiscriminator.Deserialize<SeedApi.ProtocolObjectEvent?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.ProtocolObjectEvent"),
                _ => json.Deserialize<object?>(options),
            };
            return new StreamDataContextWithEnvelopeSchemaResponse(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            StreamDataContextWithEnvelopeSchemaResponse value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Event switch
                {
                    "heartbeat" => JsonSerializer.SerializeToNode(value.Value, options),
                    "string_data" => JsonSerializer.SerializeToNode(value.Value, options),
                    "number_data" => JsonSerializer.SerializeToNode(value.Value, options),
                    "object_data" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["event"] = value.Event;
            json.WriteTo(writer, options);
        }

        public override StreamDataContextWithEnvelopeSchemaResponse ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new StreamDataContextWithEnvelopeSchemaResponse(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StreamDataContextWithEnvelopeSchemaResponse value,
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
        public Heartbeat(SeedApi.ProtocolHeartbeat value)
        {
            Value = value;
        }

        internal SeedApi.ProtocolHeartbeat Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamDataContextWithEnvelopeSchemaResponse.Heartbeat(
            SeedApi.ProtocolHeartbeat value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for string_data
    /// </summary>
    [Serializable]
    public struct StringData
    {
        public StringData(SeedApi.ProtocolStringEvent value)
        {
            Value = value;
        }

        internal SeedApi.ProtocolStringEvent Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamDataContextWithEnvelopeSchemaResponse.StringData(
            SeedApi.ProtocolStringEvent value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for number_data
    /// </summary>
    [Serializable]
    public struct NumberData
    {
        public NumberData(SeedApi.ProtocolNumberEvent value)
        {
            Value = value;
        }

        internal SeedApi.ProtocolNumberEvent Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamDataContextWithEnvelopeSchemaResponse.NumberData(
            SeedApi.ProtocolNumberEvent value
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

        public static implicit operator StreamDataContextWithEnvelopeSchemaResponse.ObjectData(
            SeedApi.ProtocolObjectEvent value
        ) => new(value);
    }
}
