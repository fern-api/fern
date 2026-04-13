// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[JsonConverter(typeof(UnionTypeWithAliasSetVariant.JsonConverter))]
[Serializable]
public record UnionTypeWithAliasSetVariant
{
    internal UnionTypeWithAliasSetVariant(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionTypeWithAliasSetVariant with <see cref="UnionTypeWithAliasSetVariant.AliasVariant"/>.
    /// </summary>
    public UnionTypeWithAliasSetVariant(UnionTypeWithAliasSetVariant.AliasVariant value)
    {
        Type = "aliasVariant";
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
    /// Returns the value as a <see cref="HashSet<AliasVariantType>"/> if <see cref="Type"/> is 'aliasVariant', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'aliasVariant'.</exception>
    public HashSet<AliasVariantType> AsAliasVariant() =>
        IsAliasVariant
            ? (HashSet<AliasVariantType>)Value!
            : throw new System.Exception("UnionTypeWithAliasSetVariant.Type is not 'aliasVariant'");

    public T Match<T>(
        Func<HashSet<AliasVariantType>, T> onAliasVariant,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "aliasVariant" => onAliasVariant(AsAliasVariant()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<HashSet<AliasVariantType>> onAliasVariant,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "aliasVariant":
                onAliasVariant(AsAliasVariant());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="HashSet<AliasVariantType>"/> and returns true if successful.
    /// </summary>
    public bool TryAsAliasVariant(out HashSet<AliasVariantType>? value)
    {
        if (Type == "aliasVariant")
        {
            value = (HashSet<AliasVariantType>)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionTypeWithAliasSetVariant(
        UnionTypeWithAliasSetVariant.AliasVariant value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionTypeWithAliasSetVariant>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(UnionTypeWithAliasSetVariant).IsAssignableFrom(typeToConvert);

        public override UnionTypeWithAliasSetVariant Read(
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
                "aliasVariant" => json.GetProperty("value")
                    .Deserialize<HashSet<AliasVariantType>?>(options)
                    ?? throw new JsonException("Failed to deserialize HashSet<AliasVariantType>"),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionTypeWithAliasSetVariant(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionTypeWithAliasSetVariant value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "aliasVariant" => new JsonObject
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
    /// Discriminated union type for aliasVariant
    /// </summary>
    [Serializable]
    public record AliasVariant
    {
        public AliasVariant(HashSet<AliasVariantType> value)
        {
            Value = value;
        }

        internal HashSet<AliasVariantType> Value { get; set; } = new HashSet<AliasVariantType>();

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionTypeWithAliasSetVariant.AliasVariant(
            HashSet<AliasVariantType> value
        ) => new(value);
    }
}
