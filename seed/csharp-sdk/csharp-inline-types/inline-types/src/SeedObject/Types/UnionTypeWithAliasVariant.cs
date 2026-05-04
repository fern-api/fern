// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[JsonConverter(typeof(UnionTypeWithAliasVariant.JsonConverter))]
[Serializable]
public record UnionTypeWithAliasVariant
{
    internal UnionTypeWithAliasVariant(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionTypeWithAliasVariant with <see cref="UnionTypeWithAliasVariant.AliasVariant"/>.
    /// </summary>
    public UnionTypeWithAliasVariant(UnionTypeWithAliasVariant.AliasVariant value)
    {
        Type = "aliasVariant";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionTypeWithAliasVariant with <see cref="UnionTypeWithAliasVariant.NonAliasVariant"/>.
    /// </summary>
    public UnionTypeWithAliasVariant(UnionTypeWithAliasVariant.NonAliasVariant value)
    {
        Type = "nonAliasVariant";
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
    /// Returns true if <see cref="Type"/> is "aliasVariant"
    /// </summary>
    public bool IsAliasVariant => Type == "aliasVariant";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "nonAliasVariant"
    /// </summary>
    public bool IsNonAliasVariant => Type == "nonAliasVariant";

    /// <summary>
    /// Returns the value as a <see cref="SeedObject.AliasVariantType"/> if <see cref="Type"/> is 'aliasVariant', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'aliasVariant'.</exception>
    public SeedObject.AliasVariantType AsAliasVariant() =>
        IsAliasVariant
            ? (SeedObject.AliasVariantType)Value!
            : throw new global::System.Exception(
                "UnionTypeWithAliasVariant.Type is not 'aliasVariant'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedObject.NonAliasVariant"/> if <see cref="Type"/> is 'nonAliasVariant', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'nonAliasVariant'.</exception>
    public SeedObject.NonAliasVariant AsNonAliasVariant() =>
        IsNonAliasVariant
            ? (SeedObject.NonAliasVariant)Value!
            : throw new global::System.Exception(
                "UnionTypeWithAliasVariant.Type is not 'nonAliasVariant'"
            );

    public T Match<T>(
        Func<SeedObject.AliasVariantType, T> onAliasVariant,
        Func<SeedObject.NonAliasVariant, T> onNonAliasVariant,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "aliasVariant" => onAliasVariant(AsAliasVariant()),
            "nonAliasVariant" => onNonAliasVariant(AsNonAliasVariant()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedObject.AliasVariantType> onAliasVariant,
        Action<SeedObject.NonAliasVariant> onNonAliasVariant,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "aliasVariant":
                onAliasVariant(AsAliasVariant());
                break;
            case "nonAliasVariant":
                onNonAliasVariant(AsNonAliasVariant());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedObject.AliasVariantType"/> and returns true if successful.
    /// </summary>
    public bool TryAsAliasVariant(out SeedObject.AliasVariantType? value)
    {
        if (Type == "aliasVariant")
        {
            value = (SeedObject.AliasVariantType)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedObject.NonAliasVariant"/> and returns true if successful.
    /// </summary>
    public bool TryAsNonAliasVariant(out SeedObject.NonAliasVariant? value)
    {
        if (Type == "nonAliasVariant")
        {
            value = (SeedObject.NonAliasVariant)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionTypeWithAliasVariant(
        UnionTypeWithAliasVariant.AliasVariant value
    ) => new(value);

    public static implicit operator UnionTypeWithAliasVariant(
        UnionTypeWithAliasVariant.NonAliasVariant value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionTypeWithAliasVariant>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionTypeWithAliasVariant).IsAssignableFrom(typeToConvert);

        public override UnionTypeWithAliasVariant Read(
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
                "aliasVariant" =>
                    jsonWithoutDiscriminator.Deserialize<SeedObject.AliasVariantType?>(options)
                        ?? throw new JsonException(
                            "Failed to deserialize SeedObject.AliasVariantType"
                        ),
                "nonAliasVariant" =>
                    jsonWithoutDiscriminator.Deserialize<SeedObject.NonAliasVariant?>(options)
                        ?? throw new JsonException(
                            "Failed to deserialize SeedObject.NonAliasVariant"
                        ),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionTypeWithAliasVariant(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionTypeWithAliasVariant value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "aliasVariant" => JsonSerializer.SerializeToNode(value.Value, options),
                    "nonAliasVariant" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override UnionTypeWithAliasVariant ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new UnionTypeWithAliasVariant(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionTypeWithAliasVariant value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for aliasVariant
    /// </summary>
    [Serializable]
    public struct AliasVariant
    {
        public AliasVariant(SeedObject.AliasVariantType value)
        {
            Value = value;
        }

        internal SeedObject.AliasVariantType Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionTypeWithAliasVariant.AliasVariant(
            SeedObject.AliasVariantType value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for nonAliasVariant
    /// </summary>
    [Serializable]
    public struct NonAliasVariant
    {
        public NonAliasVariant(SeedObject.NonAliasVariant value)
        {
            Value = value;
        }

        internal SeedObject.NonAliasVariant Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionTypeWithAliasVariant.NonAliasVariant(
            SeedObject.NonAliasVariant value
        ) => new(value);
    }
}
