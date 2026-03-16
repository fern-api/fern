// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
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

    [JsonPropertyName("prop")]
    public required Types.AliasPropertyType Prop { get; set; }

    /// <summary>
    /// Returns true if <see cref="Type"/> is "aliasVariant"
    /// </summary>
    public bool IsAliasVariant => Type == "aliasVariant";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "nonAliasVariant"
    /// </summary>
    public bool IsNonAliasVariant => Type == "nonAliasVariant";

    /// <summary>
    /// Returns the value as a <see cref="SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType"/> if <see cref="Type"/> is 'aliasVariant', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'aliasVariant'.</exception>
    public SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType AsAliasVariant() =>
        IsAliasVariant
            ? (SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType)Value!
            : throw new System.Exception("UnionTypeWithAliasVariant.Type is not 'aliasVariant'");

    /// <summary>
    /// Returns the value as a <see cref="SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant"/> if <see cref="Type"/> is 'nonAliasVariant', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'nonAliasVariant'.</exception>
    public SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant AsNonAliasVariant() =>
        IsNonAliasVariant
            ? (SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant)Value!
            : throw new System.Exception("UnionTypeWithAliasVariant.Type is not 'nonAliasVariant'");

    public T Match<T>(
        Func<SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType, T> onAliasVariant,
        Func<SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant, T> onNonAliasVariant,
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
        Action<SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType> onAliasVariant,
        Action<SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant> onNonAliasVariant,
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
    /// Attempts to cast the value to a <see cref="SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType"/> and returns true if successful.
    /// </summary>
    public bool TryAsAliasVariant(
        out SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType? value
    )
    {
        if (Type == "aliasVariant")
        {
            value = (SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant"/> and returns true if successful.
    /// </summary>
    public bool TryAsNonAliasVariant(
        out SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant? value
    )
    {
        if (Type == "nonAliasVariant")
        {
            value = (SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant)Value!;
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
        [JsonPropertyName("prop")]
        public required Types.AliasPropertyType Prop { get; set; }
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionTypeWithAliasVariant>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(UnionTypeWithAliasVariant).IsAssignableFrom(typeToConvert);

        public override UnionTypeWithAliasVariant Read(
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

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("type");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "aliasVariant" =>
                    jsonWithoutDiscriminator.Deserialize<SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType"
                        ),
                "nonAliasVariant" =>
                    jsonWithoutDiscriminator.Deserialize<SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant"
                        ),
                _ => json.Deserialize<object?>(options),
            };
            var baseProperties =
                json.Deserialize<UnionTypeWithAliasVariant.BaseProperties>(options)
                ?? throw new JsonException(
                    "Failed to deserialize UnionTypeWithAliasVariant.BaseProperties"
                );
            return new UnionTypeWithAliasVariant(discriminator, value)
            {
                Prop = baseProperties.Prop,
            };
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
            var basePropertiesJson =
                JsonSerializer.SerializeToNode(
                    new UnionTypeWithAliasVariant.BaseProperties { Prop = value.Prop },
                    options
                )
                ?? throw new JsonException(
                    "Failed to serialize UnionTypeWithAliasVariant.BaseProperties"
                );
            foreach (var property in basePropertiesJson.AsObject())
            {
                json[property.Key] = property.Value;
            }
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for aliasVariant
    /// </summary>
    [Serializable]
    public struct AliasVariant
    {
        public AliasVariant(SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType value)
        {
            Value = value;
        }

        internal SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionTypeWithAliasVariant.AliasVariant(
            SeedObject.UnionTypeWithAliasVariant.Types.AliasVariantType value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for nonAliasVariant
    /// </summary>
    [Serializable]
    public struct NonAliasVariant
    {
        public NonAliasVariant(SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant value)
        {
            Value = value;
        }

        internal SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionTypeWithAliasVariant.NonAliasVariant(
            SeedObject.UnionTypeWithAliasVariant.Types.NonAliasVariant value
        ) => new(value);
    }

    public static class Types
    {
        [Serializable]
        public record AliasVariantType : IJsonOnDeserialized
        {
            [JsonExtensionData]
            private readonly IDictionary<string, JsonElement> _extensionData =
                new Dictionary<string, JsonElement>();

            [JsonPropertyName("prop")]
            public required string Prop { get; set; }

            [JsonIgnore]
            public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

            void IJsonOnDeserialized.OnDeserialized() =>
                AdditionalProperties.CopyFromExtensionData(_extensionData);

            /// <inheritdoc />
            public override string ToString()
            {
                return JsonUtils.Serialize(this);
            }
        }

        [Serializable]
        public record NonAliasVariant : IJsonOnDeserialized
        {
            [JsonExtensionData]
            private readonly IDictionary<string, JsonElement> _extensionData =
                new Dictionary<string, JsonElement>();

            [JsonPropertyName("prop")]
            public required string Prop { get; set; }

            [JsonIgnore]
            public ReadOnlyAdditionalProperties AdditionalProperties { get; private set; } = new();

            void IJsonOnDeserialized.OnDeserialized() =>
                AdditionalProperties.CopyFromExtensionData(_extensionData);

            /// <inheritdoc />
            public override string ToString()
            {
                return JsonUtils.Serialize(this);
            }
        }
    }
}
