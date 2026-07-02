// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedNurseryApi.Core;

namespace SeedNurseryApi;

[JsonConverter(typeof(BackupConfig.JsonConverter))]
[Serializable]
public record BackupConfig
{
    internal BackupConfig(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of BackupConfig with <see cref="BackupConfig.Override"/>.
    /// </summary>
    public BackupConfig(BackupConfig.Override value)
    {
        Type = "override";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of BackupConfig with <see cref="BackupConfig.Fallback"/>.
    /// </summary>
    public BackupConfig(BackupConfig.Fallback value)
    {
        Type = "fallback";
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
    /// Returns true if <see cref="Type"/> is "override"
    /// </summary>
    public bool IsOverride => Type == "override";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "fallback"
    /// </summary>
    public bool IsFallback => Type == "fallback";

    /// <summary>
    /// Returns the value as a <see cref="SeedNurseryApi.BackupOverride"/> if <see cref="Type"/> is 'override', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'override'.</exception>
    public SeedNurseryApi.BackupOverride AsOverride() =>
        IsOverride
            ? (SeedNurseryApi.BackupOverride)Value!
            : throw new global::System.Exception("BackupConfig.Type is not 'override'");

    /// <summary>
    /// Returns the value as a <see cref="SeedNurseryApi.BackupOverride"/> if <see cref="Type"/> is 'fallback', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'fallback'.</exception>
    public SeedNurseryApi.BackupOverride AsFallback() =>
        IsFallback
            ? (SeedNurseryApi.BackupOverride)Value!
            : throw new global::System.Exception("BackupConfig.Type is not 'fallback'");

    public T Match<T>(
        Func<SeedNurseryApi.BackupOverride, T> onOverride,
        Func<SeedNurseryApi.BackupOverride, T> onFallback,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "override" => onOverride(AsOverride()),
            "fallback" => onFallback(AsFallback()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedNurseryApi.BackupOverride> onOverride,
        Action<SeedNurseryApi.BackupOverride> onFallback,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "override":
                onOverride(AsOverride());
                break;
            case "fallback":
                onFallback(AsFallback());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNurseryApi.BackupOverride"/> and returns true if successful.
    /// </summary>
    public bool TryAsOverride(out SeedNurseryApi.BackupOverride? value)
    {
        if (Type == "override")
        {
            value = (SeedNurseryApi.BackupOverride)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNurseryApi.BackupOverride"/> and returns true if successful.
    /// </summary>
    public bool TryAsFallback(out SeedNurseryApi.BackupOverride? value)
    {
        if (Type == "fallback")
        {
            value = (SeedNurseryApi.BackupOverride)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator BackupConfig(BackupConfig.Override value) => new(value);

    public static implicit operator BackupConfig(BackupConfig.Fallback value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<BackupConfig>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(BackupConfig).IsAssignableFrom(typeToConvert);

        public override BackupConfig Read(
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
                "override" => jsonWithoutDiscriminator.Deserialize<SeedNurseryApi.BackupOverride?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedNurseryApi.BackupOverride"),
                "fallback" => jsonWithoutDiscriminator.Deserialize<SeedNurseryApi.BackupOverride?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedNurseryApi.BackupOverride"),
                _ => json.Deserialize<object?>(options),
            };
            return new BackupConfig(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            BackupConfig value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "override" => JsonSerializer.SerializeToNode(value.Value, options),
                    "fallback" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override BackupConfig ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new BackupConfig(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            BackupConfig value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for override
    /// </summary>
    [Serializable]
    public struct Override
    {
        public Override(SeedNurseryApi.BackupOverride value)
        {
            Value = value;
        }

        internal SeedNurseryApi.BackupOverride Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BackupConfig.Override(
            SeedNurseryApi.BackupOverride value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for fallback
    /// </summary>
    [Serializable]
    public struct Fallback
    {
        public Fallback(SeedNurseryApi.BackupOverride value)
        {
            Value = value;
        }

        internal SeedNurseryApi.BackupOverride Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator BackupConfig.Fallback(
            SeedNurseryApi.BackupOverride value
        ) => new(value);
    }
}
