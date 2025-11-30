// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedLiteral.Core;

namespace SeedLiteral;

[JsonConverter(typeof(DiscriminatedLiteral.JsonConverter))]
[Serializable]
public record DiscriminatedLiteral
{
    internal DiscriminatedLiteral(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of DiscriminatedLiteral with <see cref="DiscriminatedLiteral.CustomName"/>.
    /// </summary>
    public DiscriminatedLiteral(DiscriminatedLiteral.CustomName value)
    {
        Type = "customName";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DiscriminatedLiteral with <see cref="DiscriminatedLiteral.DefaultName"/>.
    /// </summary>
    public DiscriminatedLiteral(DiscriminatedLiteral.DefaultName value)
    {
        Type = "defaultName";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DiscriminatedLiteral with <see cref="DiscriminatedLiteral.George"/>.
    /// </summary>
    public DiscriminatedLiteral(DiscriminatedLiteral.George value)
    {
        Type = "george";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DiscriminatedLiteral with <see cref="DiscriminatedLiteral.LiteralGeorge"/>.
    /// </summary>
    public DiscriminatedLiteral(DiscriminatedLiteral.LiteralGeorge value)
    {
        Type = "literalGeorge";
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
    /// Returns true if <see cref="Type"/> is "customName"
    /// </summary>
    public bool IsCustomName => Type == "customName";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "defaultName"
    /// </summary>
    public bool IsDefaultName => Type == "defaultName";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "george"
    /// </summary>
    public bool IsGeorge => Type == "george";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "literalGeorge"
    /// </summary>
    public bool IsLiteralGeorge => Type == "literalGeorge";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'customName', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'customName'.</exception>
    public string AsCustomName() =>
        IsCustomName
            ? (string)Value!
            : throw new System.Exception("DiscriminatedLiteral.Type is not 'customName'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'defaultName', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'defaultName'.</exception>
    public string AsDefaultName() =>
        IsDefaultName
            ? (string)Value!
            : throw new System.Exception("DiscriminatedLiteral.Type is not 'defaultName'");

    /// <summary>
    /// Returns the value as a <see cref="bool"/> if <see cref="Type"/> is 'george', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'george'.</exception>
    public bool AsGeorge() =>
        IsGeorge
            ? (bool)Value!
            : throw new System.Exception("DiscriminatedLiteral.Type is not 'george'");

    /// <summary>
    /// Returns the value as a <see cref="bool"/> if <see cref="Type"/> is 'literalGeorge', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'literalGeorge'.</exception>
    public bool AsLiteralGeorge() =>
        IsLiteralGeorge
            ? (bool)Value!
            : throw new System.Exception("DiscriminatedLiteral.Type is not 'literalGeorge'");

    public T Match<T>(
        Func<string, T> onCustomName,
        Func<string, T> onDefaultName,
        Func<bool, T> onGeorge,
        Func<bool, T> onLiteralGeorge,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "customName" => onCustomName(AsCustomName()),
            "defaultName" => onDefaultName(AsDefaultName()),
            "george" => onGeorge(AsGeorge()),
            "literalGeorge" => onLiteralGeorge(AsLiteralGeorge()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<string> onCustomName,
        Action<string> onDefaultName,
        Action<bool> onGeorge,
        Action<bool> onLiteralGeorge,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "customName":
                onCustomName(AsCustomName());
                break;
            case "defaultName":
                onDefaultName(AsDefaultName());
                break;
            case "george":
                onGeorge(AsGeorge());
                break;
            case "literalGeorge":
                onLiteralGeorge(AsLiteralGeorge());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsCustomName(out string? value)
    {
        if (Type == "customName")
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
    public bool TryAsDefaultName(out string? value)
    {
        if (Type == "defaultName")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="bool"/> and returns true if successful.
    /// </summary>
    public bool TryAsGeorge(out bool? value)
    {
        if (Type == "george")
        {
            value = (bool)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="bool"/> and returns true if successful.
    /// </summary>
    public bool TryAsLiteralGeorge(out bool? value)
    {
        if (Type == "literalGeorge")
        {
            value = (bool)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator DiscriminatedLiteral(DiscriminatedLiteral.CustomName value) =>
        new(value);

    public static implicit operator DiscriminatedLiteral(DiscriminatedLiteral.DefaultName value) =>
        new(value);

    public static implicit operator DiscriminatedLiteral(DiscriminatedLiteral.George value) =>
        new(value);

    public static implicit operator DiscriminatedLiteral(
        DiscriminatedLiteral.LiteralGeorge value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DiscriminatedLiteral>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(DiscriminatedLiteral).IsAssignableFrom(typeToConvert);

        public override DiscriminatedLiteral Read(
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
                "customName" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "defaultName" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "george" => json.GetProperty("value").Deserialize<bool>(options),
                "literalGeorge" => json.GetProperty("value").Deserialize<bool>(options),
                _ => json.Deserialize<object?>(options),
            };
            return new DiscriminatedLiteral(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            DiscriminatedLiteral value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "customName" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "defaultName" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "george" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "literalGeorge" => new JsonObject
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
    /// Discriminated union type for customName
    /// </summary>
    [Serializable]
    public record CustomName
    {
        public CustomName(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator DiscriminatedLiteral.CustomName(string value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for defaultName
    /// </summary>
    [Serializable]
    public record DefaultName
    {
        public DefaultName(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator DiscriminatedLiteral.DefaultName(string value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for george
    /// </summary>
    [Serializable]
    public struct George
    {
        public George(bool value)
        {
            Value = value;
        }

        internal bool Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DiscriminatedLiteral.George(bool value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for literalGeorge
    /// </summary>
    [Serializable]
    public struct LiteralGeorge
    {
        public LiteralGeorge(bool value)
        {
            Value = value;
        }

        internal bool Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DiscriminatedLiteral.LiteralGeorge(bool value) =>
            new(value);
    }
}
