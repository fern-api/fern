// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;

namespace SeedExamples.Commons;

[JsonConverter(typeof(SeedExamples.Commons.EventInfo.JsonConverter))]
[Serializable]
public record EventInfo
{
    internal EventInfo(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of EventInfo with <see cref="SeedExamples.Commons.EventInfo.Metadata"/>.
    /// </summary>
    public EventInfo(SeedExamples.Commons.EventInfo.Metadata value)
    {
        Type = "metadata";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of EventInfo with <see cref="SeedExamples.Commons.EventInfo.Tag"/>.
    /// </summary>
    public EventInfo(SeedExamples.Commons.EventInfo.Tag value)
    {
        Type = "tag";
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
    /// Returns true if <see cref="Type"/> is "metadata"
    /// </summary>
    public bool IsMetadata => Type == "metadata";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "tag"
    /// </summary>
    public bool IsTag => Type == "tag";

    /// <summary>
    /// Returns the value as a <see cref="SeedExamples.Commons.Metadata"/> if <see cref="Type"/> is 'metadata', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'metadata'.</exception>
    public SeedExamples.Commons.Metadata AsMetadata() =>
        IsMetadata
            ? (SeedExamples.Commons.Metadata)Value!
            : throw new Exception("SeedExamples.Commons.EventInfo.Type is not 'metadata'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'tag', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'tag'.</exception>
    public string AsTag() =>
        IsTag
            ? (string)Value!
            : throw new Exception("SeedExamples.Commons.EventInfo.Type is not 'tag'");

    public T Match<T>(
        Func<SeedExamples.Commons.Metadata, T> onMetadata,
        Func<string, T> onTag,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "metadata" => onMetadata(AsMetadata()),
            "tag" => onTag(AsTag()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedExamples.Commons.Metadata> onMetadata,
        Action<string> onTag,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "metadata":
                onMetadata(AsMetadata());
                break;
            case "tag":
                onTag(AsTag());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedExamples.Commons.Metadata"/> and returns true if successful.
    /// </summary>
    public bool TryAsMetadata(out SeedExamples.Commons.Metadata? value)
    {
        if (Type == "metadata")
        {
            value = (SeedExamples.Commons.Metadata)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsTag(out string? value)
    {
        if (Type == "tag")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => SeedExamples.Core.JsonUtils.Serialize(this);

    public static implicit operator SeedExamples.Commons.EventInfo(
        SeedExamples.Commons.EventInfo.Metadata value
    ) => new(value);

    public static implicit operator SeedExamples.Commons.EventInfo(
        SeedExamples.Commons.EventInfo.Tag value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SeedExamples.Commons.EventInfo>
    {
        public override bool CanConvert(Type typeToConvert) =>
            typeof(SeedExamples.Commons.EventInfo).IsAssignableFrom(typeToConvert);

        public override SeedExamples.Commons.EventInfo Read(
            ref Utf8JsonReader reader,
            Type typeToConvert,
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

            var value = discriminator switch
            {
                "metadata" => json.Deserialize<SeedExamples.Commons.Metadata>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedExamples.Commons.Metadata"
                    ),
                "tag" => json.GetProperty("value").Deserialize<string>(options)
                    ?? throw new JsonException("Failed to deserialize string"),
                _ => json.Deserialize<object?>(options),
            };
            return new SeedExamples.Commons.EventInfo(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SeedExamples.Commons.EventInfo value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "metadata" => JsonSerializer.SerializeToNode(value.Value, options),
                    "tag" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for metadata
    /// </summary>
    [Serializable]
    public struct Metadata
    {
        public Metadata(SeedExamples.Commons.Metadata value)
        {
            Value = value;
        }

        internal SeedExamples.Commons.Metadata Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator SeedExamples.Commons.EventInfo.Metadata(
            SeedExamples.Commons.Metadata value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for tag
    /// </summary>
    [Serializable]
    public record Tag
    {
        public Tag(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator SeedExamples.Commons.EventInfo.Tag(string value) =>
            new(value);
    }
}
