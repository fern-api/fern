// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithLiteral.JsonConverter))]
[Serializable]
public record UnionWithLiteral
{
    internal UnionWithLiteral(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithLiteral with <see cref="UnionWithLiteral.Fern"/>.
    /// </summary>
    public UnionWithLiteral(UnionWithLiteral.Fern value)
    {
        Type = "fern";
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

    [JsonPropertyName("base")]
    public string Base { get; set; } = "base";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "fern"
    /// </summary>
    public bool IsFern => Type == "fern";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'fern', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'fern'.</exception>
    public string AsFern() =>
        IsFern ? (string)Value! : throw new System.Exception("UnionWithLiteral.Type is not 'fern'");

    public T Match<T>(Func<string, T> onFern, Func<string, object?, T> onUnknown_)
    {
        return Type switch
        {
            "fern" => onFern(AsFern()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(Action<string> onFern, Action<string, object?> onUnknown_)
    {
        switch (Type)
        {
            case "fern":
                onFern(AsFern());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsFern(out string? value)
    {
        if (Type == "fern")
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
        [JsonPropertyName("base")]
        public string Base { get; set; } = "base";
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithLiteral>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithLiteral).IsAssignableFrom(typeToConvert);

        public override UnionWithLiteral Read(
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

            var value = discriminator switch
            {
                "fern" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                _ => json.Deserialize<object?>(options),
            };
            var baseProperties =
                json.Deserialize<UnionWithLiteral.BaseProperties>(options)
                ?? throw new JsonException("Failed to deserialize UnionWithLiteral.BaseProperties");
            return new UnionWithLiteral(discriminator, value) { Base = baseProperties.Base };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithLiteral value,
            JsonSerializerOptions options
        )
        {
            JsonObject json =
                value.Type switch
                {
                    "fern" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    _ => JsonSerializer.SerializeToNode(value.Value, options) as JsonObject,
                } ?? new JsonObject();
            json["type"] = value.Type;
            var basePropertiesJson =
                JsonSerializer.SerializeToNode(
                    new UnionWithLiteral.BaseProperties { Base = value.Base },
                    options
                ) ?? throw new JsonException("Failed to serialize UnionWithLiteral.BaseProperties");
            foreach (var property in basePropertiesJson.AsObject())
            {
                json[property.Key] = property.Value;
            }
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for fern
    /// </summary>
    [Serializable]
    public record Fern
    {
        public Fern(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator UnionWithLiteral.Fern(string value) => new(value);
    }
}
