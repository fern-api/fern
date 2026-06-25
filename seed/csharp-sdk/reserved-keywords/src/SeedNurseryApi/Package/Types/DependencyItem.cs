// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedNurseryApi.Core;

namespace SeedNurseryApi;

[JsonConverter(typeof(DependencyItem.JsonConverter))]
[Serializable]
public record DependencyItem
{
    internal DependencyItem(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of DependencyItem with <see cref="DependencyItem.Known"/>.
    /// </summary>
    public DependencyItem(DependencyItem.Known value)
    {
        Type = "known";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DependencyItem with <see cref="DependencyItem.Unknown"/>.
    /// </summary>
    public DependencyItem(DependencyItem.Unknown value)
    {
        Type = "unknown";
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
    /// Returns true if <see cref="Type"/> is "known"
    /// </summary>
    public bool IsKnown => Type == "known";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "unknown"
    /// </summary>
    public bool IsUnknown => Type == "unknown";

    /// <summary>
    /// Returns the value as a <see cref="SeedNurseryApi.KnownDependency"/> if <see cref="Type"/> is 'known', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'known'.</exception>
    public SeedNurseryApi.KnownDependency AsKnown() =>
        IsKnown
            ? (SeedNurseryApi.KnownDependency)Value!
            : throw new global::System.Exception("DependencyItem.Type is not 'known'");

    /// <summary>
    /// Returns the value as a <see cref="SeedNurseryApi.KnownDependency"/> if <see cref="Type"/> is 'unknown', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'unknown'.</exception>
    public SeedNurseryApi.KnownDependency AsUnknown() =>
        IsUnknown
            ? (SeedNurseryApi.KnownDependency)Value!
            : throw new global::System.Exception("DependencyItem.Type is not 'unknown'");

    public T Match<T>(
        Func<SeedNurseryApi.KnownDependency, T> onKnown,
        Func<SeedNurseryApi.KnownDependency, T> onUnknown,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "known" => onKnown(AsKnown()),
            "unknown" => onUnknown(AsUnknown()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedNurseryApi.KnownDependency> onKnown,
        Action<SeedNurseryApi.KnownDependency> onUnknown,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "known":
                onKnown(AsKnown());
                break;
            case "unknown":
                onUnknown(AsUnknown());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNurseryApi.KnownDependency"/> and returns true if successful.
    /// </summary>
    public bool TryAsKnown(out SeedNurseryApi.KnownDependency? value)
    {
        if (Type == "known")
        {
            value = (SeedNurseryApi.KnownDependency)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNurseryApi.KnownDependency"/> and returns true if successful.
    /// </summary>
    public bool TryAsUnknown(out SeedNurseryApi.KnownDependency? value)
    {
        if (Type == "unknown")
        {
            value = (SeedNurseryApi.KnownDependency)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator DependencyItem(DependencyItem.Known value) => new(value);

    public static implicit operator DependencyItem(DependencyItem.Unknown value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DependencyItem>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DependencyItem).IsAssignableFrom(typeToConvert);

        public override DependencyItem Read(
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
                "known" => jsonWithoutDiscriminator.Deserialize<SeedNurseryApi.KnownDependency?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedNurseryApi.KnownDependency"
                    ),
                "unknown" => jsonWithoutDiscriminator.Deserialize<SeedNurseryApi.KnownDependency?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedNurseryApi.KnownDependency"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new DependencyItem(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            DependencyItem value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "known" => JsonSerializer.SerializeToNode(value.Value, options),
                    "unknown" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override DependencyItem ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new DependencyItem(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            DependencyItem value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for known
    /// </summary>
    [Serializable]
    public struct Known
    {
        public Known(SeedNurseryApi.KnownDependency value)
        {
            Value = value;
        }

        internal SeedNurseryApi.KnownDependency Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DependencyItem.Known(
            SeedNurseryApi.KnownDependency value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for unknown
    /// </summary>
    [Serializable]
    public struct Unknown
    {
        public Unknown(SeedNurseryApi.KnownDependency value)
        {
            Value = value;
        }

        internal SeedNurseryApi.KnownDependency Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DependencyItem.Unknown(
            SeedNurseryApi.KnownDependency value
        ) => new(value);
    }
}
