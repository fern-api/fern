// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedTrace.Core;

namespace SeedTrace.V2.V3;

[JsonConverter(typeof(JsonConverter))]
[Serializable]
public record CustomFiles
{
    internal CustomFiles(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of CustomFiles with <see cref="Basic"/>.
    /// </summary>
    public CustomFiles(Basic value)
    {
        Type = "basic";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CustomFiles with <see cref="Custom"/>.
    /// </summary>
    public CustomFiles(Custom value)
    {
        Type = "custom";
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
    /// Returns true if <see cref="Type"/> is "basic"
    /// </summary>
    public bool IsBasic => Type == "basic";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "custom"
    /// </summary>
    public bool IsCustom => Type == "custom";

    /// <summary>
    /// Returns the value as a <see cref="BasicCustomFiles"/> if <see cref="Type"/> is 'basic', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'basic'.</exception>
    public BasicCustomFiles AsBasic() =>
        IsBasic
            ? (BasicCustomFiles)Value!
            : throw new Exception("SeedTrace.V2.V3.CustomFiles.Type is not 'basic'");

    /// <summary>
    /// Returns the value as a <see cref="Dictionary<SeedTrace.Language, SeedTrace.V2.V3.Files>"/> if <see cref="Type"/> is 'custom', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'custom'.</exception>
    public Dictionary<Language, Files> AsCustom() =>
        IsCustom
            ? (Dictionary<Language, Files>)Value!
            : throw new Exception("SeedTrace.V2.V3.CustomFiles.Type is not 'custom'");

    public T Match<T>(
        Func<BasicCustomFiles, T> onBasic,
        Func<Dictionary<Language, Files>, T> onCustom,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "basic" => onBasic(AsBasic()),
            "custom" => onCustom(AsCustom()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<BasicCustomFiles> onBasic,
        Action<Dictionary<Language, Files>> onCustom,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "basic":
                onBasic(AsBasic());
                break;
            case "custom":
                onCustom(AsCustom());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="BasicCustomFiles"/> and returns true if successful.
    /// </summary>
    public bool TryAsBasic(out BasicCustomFiles? value)
    {
        if (Type == "basic")
        {
            value = (BasicCustomFiles)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="Dictionary<SeedTrace.Language, SeedTrace.V2.V3.Files>"/> and returns true if successful.
    /// </summary>
    public bool TryAsCustom(out Dictionary<Language, Files>? value)
    {
        if (Type == "custom")
        {
            value = (Dictionary<Language, Files>)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator CustomFiles(Basic value) => new(value);

    public static implicit operator CustomFiles(Custom value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CustomFiles>
    {
        public override bool CanConvert(Type typeToConvert) =>
            typeof(CustomFiles).IsAssignableFrom(typeToConvert);

        public override CustomFiles Read(
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
                "basic" => json.Deserialize<BasicCustomFiles>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize SeedTrace.V2.V3.BasicCustomFiles"
                    ),
                "custom" => json.GetProperty("value")
                    .Deserialize<Dictionary<Language, Files>>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize Dictionary<SeedTrace.Language, SeedTrace.V2.V3.Files>"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new CustomFiles(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            CustomFiles value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "basic" => JsonSerializer.SerializeToNode(value.Value, options),
                    "custom" => new JsonObject
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
    /// Discriminated union type for basic
    /// </summary>
    [Serializable]
    public struct Basic
    {
        public Basic(BasicCustomFiles value)
        {
            Value = value;
        }

        internal BasicCustomFiles Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Basic(BasicCustomFiles value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for custom
    /// </summary>
    [Serializable]
    public record Custom
    {
        public Custom(Dictionary<Language, Files> value)
        {
            Value = value;
        }

        internal Dictionary<Language, Files> Value { get; set; } =
            new Dictionary<Language, Files>();

        public override string ToString() => Value.ToString();

        public static implicit operator Custom(Dictionary<Language, Files> value) => new(value);
    }
}
