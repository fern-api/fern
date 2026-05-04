// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// A discriminated union request matching the Vectara pattern (FER-9556). Each variant inherits stream_response from UnionStreamRequestBase via allOf. The importer pins stream_response to Literal[True/False] at this union level, but the allOf inheritance re-introduces it as boolean in each variant, causing the type conflict.
/// </summary>
[JsonConverter(typeof(StreamXFernStreamingUnionRequest.JsonConverter))]
[Serializable]
public record StreamXFernStreamingUnionRequest
{
    internal StreamXFernStreamingUnionRequest(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of StreamXFernStreamingUnionRequest with <see cref="StreamXFernStreamingUnionRequest.Message"/>.
    /// </summary>
    public StreamXFernStreamingUnionRequest(StreamXFernStreamingUnionRequest.Message value)
    {
        Type = "message";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of StreamXFernStreamingUnionRequest with <see cref="StreamXFernStreamingUnionRequest.Interrupt"/>.
    /// </summary>
    public StreamXFernStreamingUnionRequest(StreamXFernStreamingUnionRequest.Interrupt value)
    {
        Type = "interrupt";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of StreamXFernStreamingUnionRequest with <see cref="StreamXFernStreamingUnionRequest.Compact"/>.
    /// </summary>
    public StreamXFernStreamingUnionRequest(StreamXFernStreamingUnionRequest.Compact value)
    {
        Type = "compact";
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

    [JsonPropertyName("stream_response")]
    public bool StreamResponse { get; set; } = false;

    /// <summary>
    /// Returns true if <see cref="Type"/> is "message"
    /// </summary>
    public bool IsMessage => Type == "message";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "interrupt"
    /// </summary>
    public bool IsInterrupt => Type == "interrupt";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "compact"
    /// </summary>
    public bool IsCompact => Type == "compact";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionStreamMessageVariant"/> if <see cref="Type"/> is 'message', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'message'.</exception>
    public SeedApi.UnionStreamMessageVariant AsMessage() =>
        IsMessage
            ? (SeedApi.UnionStreamMessageVariant)Value!
            : throw new global::System.Exception(
                "StreamXFernStreamingUnionRequest.Type is not 'message'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionStreamInterruptVariant"/> if <see cref="Type"/> is 'interrupt', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'interrupt'.</exception>
    public SeedApi.UnionStreamInterruptVariant AsInterrupt() =>
        IsInterrupt
            ? (SeedApi.UnionStreamInterruptVariant)Value!
            : throw new global::System.Exception(
                "StreamXFernStreamingUnionRequest.Type is not 'interrupt'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionStreamCompactVariant"/> if <see cref="Type"/> is 'compact', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'compact'.</exception>
    public SeedApi.UnionStreamCompactVariant AsCompact() =>
        IsCompact
            ? (SeedApi.UnionStreamCompactVariant)Value!
            : throw new global::System.Exception(
                "StreamXFernStreamingUnionRequest.Type is not 'compact'"
            );

    public T Match<T>(
        Func<SeedApi.UnionStreamMessageVariant, T> onMessage,
        Func<SeedApi.UnionStreamInterruptVariant, T> onInterrupt,
        Func<SeedApi.UnionStreamCompactVariant, T> onCompact,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "message" => onMessage(AsMessage()),
            "interrupt" => onInterrupt(AsInterrupt()),
            "compact" => onCompact(AsCompact()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.UnionStreamMessageVariant> onMessage,
        Action<SeedApi.UnionStreamInterruptVariant> onInterrupt,
        Action<SeedApi.UnionStreamCompactVariant> onCompact,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "message":
                onMessage(AsMessage());
                break;
            case "interrupt":
                onInterrupt(AsInterrupt());
                break;
            case "compact":
                onCompact(AsCompact());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionStreamMessageVariant"/> and returns true if successful.
    /// </summary>
    public bool TryAsMessage(out SeedApi.UnionStreamMessageVariant? value)
    {
        if (Type == "message")
        {
            value = (SeedApi.UnionStreamMessageVariant)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionStreamInterruptVariant"/> and returns true if successful.
    /// </summary>
    public bool TryAsInterrupt(out SeedApi.UnionStreamInterruptVariant? value)
    {
        if (Type == "interrupt")
        {
            value = (SeedApi.UnionStreamInterruptVariant)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionStreamCompactVariant"/> and returns true if successful.
    /// </summary>
    public bool TryAsCompact(out SeedApi.UnionStreamCompactVariant? value)
    {
        if (Type == "compact")
        {
            value = (SeedApi.UnionStreamCompactVariant)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    /// <summary>
    /// Base properties for the discriminated union
    /// </summary>
    [Serializable]
    internal record BaseProperties
    {
        [JsonPropertyName("stream_response")]
        public bool StreamResponse { get; set; } = false;
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<StreamXFernStreamingUnionRequest>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(StreamXFernStreamingUnionRequest).IsAssignableFrom(typeToConvert);

        public override StreamXFernStreamingUnionRequest Read(
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
                "message" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionStreamMessageVariant?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionStreamMessageVariant"
                        ),
                "interrupt" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionStreamInterruptVariant?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionStreamInterruptVariant"
                        ),
                "compact" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionStreamCompactVariant?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionStreamCompactVariant"
                        ),
                _ => json.Deserialize<object?>(options),
            };
            var baseProperties =
                json.Deserialize<StreamXFernStreamingUnionRequest.BaseProperties>(options)
                ?? throw new JsonException(
                    "Failed to deserialize StreamXFernStreamingUnionRequest.BaseProperties"
                );
            return new StreamXFernStreamingUnionRequest(discriminator, value)
            {
                StreamResponse = baseProperties.StreamResponse,
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            StreamXFernStreamingUnionRequest value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "message" => JsonSerializer.SerializeToNode(value.Value, options),
                    "interrupt" => JsonSerializer.SerializeToNode(value.Value, options),
                    "compact" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            var basePropertiesJson =
                JsonSerializer.SerializeToNode(
                    new StreamXFernStreamingUnionRequest.BaseProperties
                    {
                        StreamResponse = value.StreamResponse,
                    },
                    options
                )
                ?? throw new JsonException(
                    "Failed to serialize StreamXFernStreamingUnionRequest.BaseProperties"
                );
            foreach (var property in basePropertiesJson.AsObject())
            {
                json[property.Key] = property.Value;
            }
            json.WriteTo(writer, options);
        }

        public override StreamXFernStreamingUnionRequest ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new StreamXFernStreamingUnionRequest(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            StreamXFernStreamingUnionRequest value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for message
    /// </summary>
    [Serializable]
    public struct Message
    {
        public Message(SeedApi.UnionStreamMessageVariant value)
        {
            Value = value;
        }

        internal SeedApi.UnionStreamMessageVariant Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamXFernStreamingUnionRequest.Message(
            SeedApi.UnionStreamMessageVariant value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for interrupt
    /// </summary>
    [Serializable]
    public struct Interrupt
    {
        public Interrupt(SeedApi.UnionStreamInterruptVariant value)
        {
            Value = value;
        }

        internal SeedApi.UnionStreamInterruptVariant Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamXFernStreamingUnionRequest.Interrupt(
            SeedApi.UnionStreamInterruptVariant value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for compact
    /// </summary>
    [Serializable]
    public struct Compact
    {
        public Compact(SeedApi.UnionStreamCompactVariant value)
        {
            Value = value;
        }

        internal SeedApi.UnionStreamCompactVariant Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator StreamXFernStreamingUnionRequest.Compact(
            SeedApi.UnionStreamCompactVariant value
        ) => new(value);
    }
}
