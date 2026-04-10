// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

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
    /// Returns the value as a <see cref="SeedApi.DiscriminatedLiteralCustomName"/> if <see cref="Type"/> is 'customName', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'customName'.</exception>
    public SeedApi.DiscriminatedLiteralCustomName AsCustomName() =>
        IsCustomName
            ? (SeedApi.DiscriminatedLiteralCustomName)Value!
            : throw new global::System.Exception("DiscriminatedLiteral.Type is not 'customName'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.DiscriminatedLiteralDefaultName"/> if <see cref="Type"/> is 'defaultName', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'defaultName'.</exception>
    public SeedApi.DiscriminatedLiteralDefaultName AsDefaultName() =>
        IsDefaultName
            ? (SeedApi.DiscriminatedLiteralDefaultName)Value!
            : throw new global::System.Exception("DiscriminatedLiteral.Type is not 'defaultName'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.DiscriminatedLiteralGeorge"/> if <see cref="Type"/> is 'george', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'george'.</exception>
    public SeedApi.DiscriminatedLiteralGeorge AsGeorge() =>
        IsGeorge
            ? (SeedApi.DiscriminatedLiteralGeorge)Value!
            : throw new global::System.Exception("DiscriminatedLiteral.Type is not 'george'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.DiscriminatedLiteralLiteralGeorge"/> if <see cref="Type"/> is 'literalGeorge', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'literalGeorge'.</exception>
    public SeedApi.DiscriminatedLiteralLiteralGeorge AsLiteralGeorge() =>
        IsLiteralGeorge
            ? (SeedApi.DiscriminatedLiteralLiteralGeorge)Value!
            : throw new global::System.Exception(
                "DiscriminatedLiteral.Type is not 'literalGeorge'"
            );

    public T Match<T>(
        Func<SeedApi.DiscriminatedLiteralCustomName, T> onCustomName,
        Func<SeedApi.DiscriminatedLiteralDefaultName, T> onDefaultName,
        Func<SeedApi.DiscriminatedLiteralGeorge, T> onGeorge,
        Func<SeedApi.DiscriminatedLiteralLiteralGeorge, T> onLiteralGeorge,
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
        Action<SeedApi.DiscriminatedLiteralCustomName> onCustomName,
        Action<SeedApi.DiscriminatedLiteralDefaultName> onDefaultName,
        Action<SeedApi.DiscriminatedLiteralGeorge> onGeorge,
        Action<SeedApi.DiscriminatedLiteralLiteralGeorge> onLiteralGeorge,
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
    /// Attempts to cast the value to a <see cref="SeedApi.DiscriminatedLiteralCustomName"/> and returns true if successful.
    /// </summary>
    public bool TryAsCustomName(out SeedApi.DiscriminatedLiteralCustomName? value)
    {
        if (Type == "customName")
        {
            value = (SeedApi.DiscriminatedLiteralCustomName)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.DiscriminatedLiteralDefaultName"/> and returns true if successful.
    /// </summary>
    public bool TryAsDefaultName(out SeedApi.DiscriminatedLiteralDefaultName? value)
    {
        if (Type == "defaultName")
        {
            value = (SeedApi.DiscriminatedLiteralDefaultName)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.DiscriminatedLiteralGeorge"/> and returns true if successful.
    /// </summary>
    public bool TryAsGeorge(out SeedApi.DiscriminatedLiteralGeorge? value)
    {
        if (Type == "george")
        {
            value = (SeedApi.DiscriminatedLiteralGeorge)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.DiscriminatedLiteralLiteralGeorge"/> and returns true if successful.
    /// </summary>
    public bool TryAsLiteralGeorge(out SeedApi.DiscriminatedLiteralLiteralGeorge? value)
    {
        if (Type == "literalGeorge")
        {
            value = (SeedApi.DiscriminatedLiteralLiteralGeorge)Value!;
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
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(DiscriminatedLiteral).IsAssignableFrom(typeToConvert);

        public override DiscriminatedLiteral Read(
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
                "customName" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.DiscriminatedLiteralCustomName?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.DiscriminatedLiteralCustomName"
                        ),
                "defaultName" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.DiscriminatedLiteralDefaultName?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.DiscriminatedLiteralDefaultName"
                        ),
                "george" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.DiscriminatedLiteralGeorge?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.DiscriminatedLiteralGeorge"
                        ),
                "literalGeorge" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.DiscriminatedLiteralLiteralGeorge?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.DiscriminatedLiteralLiteralGeorge"
                        ),
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
                    "customName" => JsonSerializer.SerializeToNode(value.Value, options),
                    "defaultName" => JsonSerializer.SerializeToNode(value.Value, options),
                    "george" => JsonSerializer.SerializeToNode(value.Value, options),
                    "literalGeorge" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override DiscriminatedLiteral ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new DiscriminatedLiteral(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            DiscriminatedLiteral value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for customName
    /// </summary>
    [Serializable]
    public struct CustomName
    {
        public CustomName(SeedApi.DiscriminatedLiteralCustomName value)
        {
            Value = value;
        }

        internal SeedApi.DiscriminatedLiteralCustomName Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DiscriminatedLiteral.CustomName(
            SeedApi.DiscriminatedLiteralCustomName value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for defaultName
    /// </summary>
    [Serializable]
    public struct DefaultName
    {
        public DefaultName(SeedApi.DiscriminatedLiteralDefaultName value)
        {
            Value = value;
        }

        internal SeedApi.DiscriminatedLiteralDefaultName Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DiscriminatedLiteral.DefaultName(
            SeedApi.DiscriminatedLiteralDefaultName value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for george
    /// </summary>
    [Serializable]
    public struct George
    {
        public George(SeedApi.DiscriminatedLiteralGeorge value)
        {
            Value = value;
        }

        internal SeedApi.DiscriminatedLiteralGeorge Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DiscriminatedLiteral.George(
            SeedApi.DiscriminatedLiteralGeorge value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for literalGeorge
    /// </summary>
    [Serializable]
    public struct LiteralGeorge
    {
        public LiteralGeorge(SeedApi.DiscriminatedLiteralLiteralGeorge value)
        {
            Value = value;
        }

        internal SeedApi.DiscriminatedLiteralLiteralGeorge Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DiscriminatedLiteral.LiteralGeorge(
            SeedApi.DiscriminatedLiteralLiteralGeorge value
        ) => new(value);
    }
}
