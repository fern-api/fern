// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

[JsonConverter(typeof(StreamEventContextProtocol.JsonConverter))]
[Serializable]
public record StreamEventContextProtocol
{
    internal StreamEventContextProtocol(string type, object? value)
    {
        Event = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of StreamEventContextProtocol with <see cref="StreamEventContextProtocol.Completion"/>.
    /// </summary>
    public StreamEventContextProtocol(StreamEventContextProtocol.Completion value)
    {
        Event = "completion";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of StreamEventContextProtocol with <see cref="StreamEventContextProtocol.Error"/>.
    /// </summary>
    public StreamEventContextProtocol(StreamEventContextProtocol.Error value)
    {
        Event = "error";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of StreamEventContextProtocol with <see cref="StreamEventContextProtocol.Notification"/>.
    /// </summary>
    public StreamEventContextProtocol(StreamEventContextProtocol.Notification value)
    {
        Event = "notification";
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
    /// Returns true if <see cref="Event"/> is "completion"
    /// </summary>
    public bool IsCompletion => Event == "completion";

    /// <summary>
    /// Returns true if <see cref="Event"/> is "error"
    /// </summary>
    public bool IsError => Event == "error";

    /// <summary>
    /// Returns true if <see cref="Event"/> is "notification"
    /// </summary>
    public bool IsNotification => Event == "notification";

    /// <summary>
    /// Returns the value as a <see cref="SeedServerSentEvents.CompletionEvent"/> if <see cref="Event"/> is 'completion', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Event"/> is not 'completion'.</exception>
    public SeedServerSentEvents.CompletionEvent AsCompletion() =>
        IsCompletion
            ? (SeedServerSentEvents.CompletionEvent)Value!
            : throw new global::System.Exception(
                "StreamEventContextProtocol.Event is not 'completion'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedServerSentEvents.ErrorEvent"/> if <see cref="Event"/> is 'error', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Event"/> is not 'error'.</exception>
    public SeedServerSentEvents.ErrorEvent AsError() =>
        IsError
            ? (SeedServerSentEvents.ErrorEvent)Value!
            : throw new global::System.Exception("StreamEventContextProtocol.Event is not 'error'");

    /// <summary>
    /// Returns the value as a <see cref="SeedServerSentEvents.EventEvent"/> if <see cref="Event"/> is 'notification', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Event"/> is not 'notification'.</exception>
    public SeedServerSentEvents.EventEvent AsNotification() =>
        IsNotification
            ? (SeedServerSentEvents.EventEvent)Value!
            : throw new global::System.Exception(
                "StreamEventContextProtocol.Event is not 'notification'"
            );

    public T Match<T>(
        Func<SeedServerSentEvents.CompletionEvent, T> onCompletion,
        Func<SeedServerSentEvents.ErrorEvent, T> onError,
        Func<SeedServerSentEvents.EventEvent, T> onNotification,
        Func<string, object?, T> onUnknown_
    )
    {
        return Event switch
        {
            "completion" => onCompletion(AsCompletion()),
            "error" => onError(AsError()),
            "notification" => onNotification(AsNotification()),
            _ => onUnknown_(Event, Value),
        };
    }

    public void Visit(
        Action<SeedServerSentEvents.CompletionEvent> onCompletion,
        Action<SeedServerSentEvents.ErrorEvent> onError,
        Action<SeedServerSentEvents.EventEvent> onNotification,
        Action<string, object?> onUnknown_
    )
    {
        switch (Event)
        {
            case "completion":
                onCompletion(AsCompletion());
                break;
            case "error":
                onError(AsError());
                break;
            case "notification":
                onNotification(AsNotification());
                break;
            default:
                onUnknown_(Event, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedServerSentEvents.CompletionEvent"/> and returns true if successful.
    /// </summary>
    public bool TryAsCompletion(out SeedServerSentEvents.CompletionEvent? value)
    {
        if (Event == "completion")
        {
            value = (SeedServerSentEvents.CompletionEvent)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedServerSentEvents.ErrorEvent"/> and returns true if successful.
    /// </summary>
    public bool TryAsError(out SeedServerSentEvents.ErrorEvent? value)
    {
        if (Event == "error")
        {
            value = (SeedServerSentEvents.ErrorEvent)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedServerSentEvents.EventEvent"/> and returns true if successful.
    /// </summary>
    public bool TryAsNotification(out SeedServerSentEvents.EventEvent? value)
    {
        if (Event == "notification")
        {
            value = (SeedServerSentEvents.EventEvent)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator StreamEventContextProtocol(
        StreamEventContextProtocol.Completion value
    ) => new(value);

    public static implicit operator StreamEventContextProtocol(
        StreamEventContextProtocol.Error value
    ) => new(value);

    public static implicit operator StreamEventContextProtocol(
        StreamEventContextProtocol.Notification value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<StreamEventContextProtocol>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(StreamEventContextProtocol).IsAssignableFrom(typeToConvert);

        public override StreamEventContextProtocol Read(
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
                "completion" =>
                    jsonWithoutDiscriminator.Deserialize<SeedServerSentEvents.CompletionEvent?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedServerSentEvents.CompletionEvent"
                        ),
                "error" => jsonWithoutDiscriminator.Deserialize<SeedServerSentEvents.ErrorEvent?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedServerSentEvents.ErrorEvent"
                    ),
                "notification" =>
                    jsonWithoutDiscriminator.Deserialize<SeedServerSentEvents.EventEvent?>(options)
                        ?? throw new JsonException(
                            "Failed to deserialize SeedServerSentEvents.EventEvent"
                        ),
                _ => json.Deserialize<object?>(options),
            };
            return new StreamEventContextProtocol(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            StreamEventContextProtocol value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Event switch
                {
                    "completion" => JsonSerializer.SerializeToNode(value.Value, options),
                    "error" => JsonSerializer.SerializeToNode(value.Value, options),
                    "notification" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["event"] = value.Event;
            json.WriteTo(writer, options);
        }

        public override StreamEventContextProtocol ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new StreamEventContextProtocol(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StreamEventContextProtocol value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Event);
        }
    }

    /// <summary>
    /// Discriminated union type for completion
    /// </summary>
    [Serializable]
    public struct Completion
    {
        public Completion(SeedServerSentEvents.CompletionEvent value)
        {
            Value = value;
        }

        internal SeedServerSentEvents.CompletionEvent Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamEventContextProtocol.Completion(
            SeedServerSentEvents.CompletionEvent value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for error
    /// </summary>
    [Serializable]
    public struct Error
    {
        public Error(SeedServerSentEvents.ErrorEvent value)
        {
            Value = value;
        }

        internal SeedServerSentEvents.ErrorEvent Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamEventContextProtocol.Error(
            SeedServerSentEvents.ErrorEvent value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for notification
    /// </summary>
    [Serializable]
    public struct Notification
    {
        public Notification(SeedServerSentEvents.EventEvent value)
        {
            Value = value;
        }

        internal SeedServerSentEvents.EventEvent Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamEventContextProtocol.Notification(
            SeedServerSentEvents.EventEvent value
        ) => new(value);
    }
}
