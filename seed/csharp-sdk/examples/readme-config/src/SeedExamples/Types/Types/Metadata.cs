// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples;

[JsonConverter(typeof(Metadata.JsonConverter))]
[Serializable]
public record Metadata
{
    internal Metadata(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of Metadata with <see cref="Metadata.Html"/>.
    /// </summary>
    public Metadata(Metadata.Html value)
    {
        Type = "html";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Metadata with <see cref="Metadata.Markdown"/>.
    /// </summary>
    public Metadata(Metadata.Markdown value)
    {
        Type = "markdown";
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

    [JsonPropertyName("extra")]
    public Dictionary<string, string> Extra { get; set; } = new Dictionary<string, string>();

    [JsonPropertyName("tags")]
    public HashSet<string> Tags { get; set; } = new HashSet<string>();

    /// <summary>
    /// Returns true if <see cref="Type"/> is "html"
    /// </summary>
    public bool IsHtml => Type == "html";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "markdown"
    /// </summary>
    public bool IsMarkdown => Type == "markdown";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'html', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'html'.</exception>
    public string AsHtml() =>
        IsHtml ? (string)Value! : throw new System.Exception("Metadata.Type is not 'html'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'markdown', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'markdown'.</exception>
    public string AsMarkdown() =>
        IsMarkdown ? (string)Value! : throw new System.Exception("Metadata.Type is not 'markdown'");

    public T Match<T>(
        Func<string, T> onHtml,
        Func<string, T> onMarkdown,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "html" => onHtml(AsHtml()),
            "markdown" => onMarkdown(AsMarkdown()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<string> onHtml,
        Action<string> onMarkdown,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "html":
                onHtml(AsHtml());
                break;
            case "markdown":
                onMarkdown(AsMarkdown());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsHtml(out string? value)
    {
        if (Type == "html")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsMarkdown(out string? value)
    {
        if (Type == "markdown")
        {
            value = (string)Value!;
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
        [JsonPropertyName("extra")]
        public Dictionary<string, string> Extra { get; set; } = new Dictionary<string, string>();

        [JsonPropertyName("tags")]
        public HashSet<string> Tags { get; set; } = new HashSet<string>();
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Metadata>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(Metadata).IsAssignableFrom(typeToConvert);

        public override Metadata Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
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
                "html" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "markdown" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                _ => json.Deserialize<object?>(options),
            };
            var baseProperties =
                json.Deserialize<Metadata.BaseProperties>(options)
                ?? throw new JsonException("Failed to deserialize Metadata.BaseProperties");
            return new Metadata(discriminator, value)
            {
                Extra = baseProperties.Extra,
                Tags = baseProperties.Tags,
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Metadata value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "html" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "markdown" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            var basePropertiesJson =
                JsonSerializer.SerializeToNode(
                    new Metadata.BaseProperties { Extra = value.Extra, Tags = value.Tags },
                    options
                ) ?? throw new JsonException("Failed to serialize Metadata.BaseProperties");
            foreach (var property in basePropertiesJson.AsObject())
            {
                json[property.Key] = property.Value;
            }
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for html
    /// </summary>
    [Serializable]
    public record Html
    {
        public Html(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator Metadata.Html(string value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for markdown
    /// </summary>
    [Serializable]
    public record Markdown
    {
        public Markdown(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator Metadata.Markdown(string value) => new(value);
    }
}
