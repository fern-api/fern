// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

[JsonConverter(typeof(UnionTypeWithAliasListVariant.JsonConverter))]
[Serializable]
public record UnionTypeWithAliasListVariant
{
    internal UnionTypeWithAliasListVariant(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionTypeWithAliasListVariant with <see cref="UnionTypeWithAliasListVariant.AliasVariant"/>.
    /// </summary>
    public UnionTypeWithAliasListVariant(UnionTypeWithAliasListVariant.AliasVariant value)
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
    /// Returns the value as a <see cref="IEnumerable<AliasVariantType>"/> if <see cref="Type"/> is 'aliasVariant', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'aliasVariant'.</exception>
    public IEnumerable<AliasVariantType> AsAliasVariant() =>
        IsAliasVariant
            ? (IEnumerable<AliasVariantType>)Value!
            : throw new System.Exception(
                "UnionTypeWithAliasListVariant.Type is not 'aliasVariant'"
            );

    public T Match<T>(
        Func<IEnumerable<AliasVariantType>, T> onAliasVariant,
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
        Action<IEnumerable<AliasVariantType>> onAliasVariant,
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
    /// Attempts to cast the value to a <see cref="IEnumerable<AliasVariantType>"/> and returns true if successful.
    /// </summary>
    public bool TryAsAliasVariant(out IEnumerable<AliasVariantType>? value)
    {
        if (Type == "aliasVariant")
        {
            value = (IEnumerable<AliasVariantType>)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionTypeWithAliasListVariant(
        UnionTypeWithAliasListVariant.AliasVariant value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionTypeWithAliasListVariant>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(UnionTypeWithAliasListVariant).IsAssignableFrom(typeToConvert);

        public override UnionTypeWithAliasListVariant Read(
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
                    .Deserialize<IEnumerable<AliasVariantType>?>(options)
                    ?? throw new JsonException(
                        "Failed to deserialize IEnumerable<AliasVariantType>"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionTypeWithAliasListVariant(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionTypeWithAliasListVariant value,
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
        public AliasVariant(IEnumerable<AliasVariantType> value)
        {
            Value = value;
        }

        internal IEnumerable<AliasVariantType> Value { get; set; } = new List<AliasVariantType>();

        public override string ToString() => Value.ToString() ?? "null";
    }
}
