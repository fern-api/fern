// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedServerSentEvents.Core;

namespace SeedServerSentEvents;

[JsonConverter(typeof(StreamEventDiscriminantInData.JsonConverter))]
[Serializable]
public record StreamEventDiscriminantInData
{
    internal StreamEventDiscriminantInData(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of StreamEventDiscriminantInData with <see cref="StreamEventDiscriminantInData.GroupCreated"/>.
    /// </summary>
    public StreamEventDiscriminantInData(StreamEventDiscriminantInData.GroupCreated value)
    {
        Type = "group.created";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of StreamEventDiscriminantInData with <see cref="StreamEventDiscriminantInData.GroupDeleted"/>.
    /// </summary>
    public StreamEventDiscriminantInData(StreamEventDiscriminantInData.GroupDeleted value)
    {
        Type = "group.deleted";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    public object? Value { get; internal set; }

    /// <summary>
    /// Returns true if <see cref="Type"/> is "group.created"
    /// </summary>
    public bool IsGroupCreated => Type == "group.created";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "group.deleted"
    /// </summary>
    public bool IsGroupDeleted => Type == "group.deleted";

    /// <summary>
    /// Returns the value as a <see cref="SeedServerSentEvents.GroupCreatedEvent"/> if <see cref="Type"/> is 'group.created', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'group.created'.</exception>
    public SeedServerSentEvents.GroupCreatedEvent AsGroupCreated() =>
        IsGroupCreated
            ? (SeedServerSentEvents.GroupCreatedEvent)Value!
            : throw new global::System.Exception(
                "StreamEventDiscriminantInData.Type is not 'group.created'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedServerSentEvents.GroupDeletedEvent"/> if <see cref="Type"/> is 'group.deleted', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'group.deleted'.</exception>
    public SeedServerSentEvents.GroupDeletedEvent AsGroupDeleted() =>
        IsGroupDeleted
            ? (SeedServerSentEvents.GroupDeletedEvent)Value!
            : throw new global::System.Exception(
                "StreamEventDiscriminantInData.Type is not 'group.deleted'"
            );

    public T Match<T>(
        Func<SeedServerSentEvents.GroupCreatedEvent, T> onGroupCreated,
        Func<SeedServerSentEvents.GroupDeletedEvent, T> onGroupDeleted,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "group.created" => onGroupCreated(AsGroupCreated()),
            "group.deleted" => onGroupDeleted(AsGroupDeleted()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedServerSentEvents.GroupCreatedEvent> onGroupCreated,
        Action<SeedServerSentEvents.GroupDeletedEvent> onGroupDeleted,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "group.created":
                onGroupCreated(AsGroupCreated());
                break;
            case "group.deleted":
                onGroupDeleted(AsGroupDeleted());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedServerSentEvents.GroupCreatedEvent"/> and returns true if successful.
    /// </summary>
    public bool TryAsGroupCreated(out SeedServerSentEvents.GroupCreatedEvent? value)
    {
        if (Type == "group.created")
        {
            value = (SeedServerSentEvents.GroupCreatedEvent)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedServerSentEvents.GroupDeletedEvent"/> and returns true if successful.
    /// </summary>
    public bool TryAsGroupDeleted(out SeedServerSentEvents.GroupDeletedEvent? value)
    {
        if (Type == "group.deleted")
        {
            value = (SeedServerSentEvents.GroupDeletedEvent)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator StreamEventDiscriminantInData(
        StreamEventDiscriminantInData.GroupCreated value
    ) => new(value);

    public static implicit operator StreamEventDiscriminantInData(
        StreamEventDiscriminantInData.GroupDeleted value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<StreamEventDiscriminantInData>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(StreamEventDiscriminantInData).IsAssignableFrom(typeToConvert);

        public override StreamEventDiscriminantInData Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property 'type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property 'type' is null");
                }

                throw new JsonException(
                    $"Discriminator property 'type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property 'type' is null");

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("type");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "group.created" =>
                    jsonWithoutDiscriminator.Deserialize<SeedServerSentEvents.GroupCreatedEvent?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedServerSentEvents.GroupCreatedEvent"
                        ),
                "group.deleted" =>
                    jsonWithoutDiscriminator.Deserialize<SeedServerSentEvents.GroupDeletedEvent?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedServerSentEvents.GroupDeletedEvent"
                        ),
                _ => json.Deserialize<object?>(options),
            };
            return new StreamEventDiscriminantInData(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            StreamEventDiscriminantInData value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "group.created" => JsonSerializer.SerializeToNode(value.Value, options),
                    "group.deleted" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override StreamEventDiscriminantInData ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new StreamEventDiscriminantInData(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StreamEventDiscriminantInData value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for group.created
    /// </summary>
    [Serializable]
    public struct GroupCreated
    {
        public GroupCreated(SeedServerSentEvents.GroupCreatedEvent value)
        {
            Value = value;
        }

        internal SeedServerSentEvents.GroupCreatedEvent Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamEventDiscriminantInData.GroupCreated(
            SeedServerSentEvents.GroupCreatedEvent value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for group.deleted
    /// </summary>
    [Serializable]
    public struct GroupDeleted
    {
        public GroupDeleted(SeedServerSentEvents.GroupDeletedEvent value)
        {
            Value = value;
        }

        internal SeedServerSentEvents.GroupDeletedEvent Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamEventDiscriminantInData.GroupDeleted(
            SeedServerSentEvents.GroupDeletedEvent value
        ) => new(value);
    }
}
