// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithDuplicativeDiscriminants.JsonConverter))]
[Serializable]
public record UnionWithDuplicativeDiscriminants
{
    internal UnionWithDuplicativeDiscriminants(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicativeDiscriminants with <see cref="UnionWithDuplicativeDiscriminants.FirstItemType"/>.
    /// </summary>
    public UnionWithDuplicativeDiscriminants(UnionWithDuplicativeDiscriminants.FirstItemType value)
    {
        Type = "firstItemType";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicativeDiscriminants with <see cref="UnionWithDuplicativeDiscriminants.SecondItemType"/>.
    /// </summary>
    public UnionWithDuplicativeDiscriminants(UnionWithDuplicativeDiscriminants.SecondItemType value)
    {
        Type = "secondItemType";
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
    /// Returns true if <see cref="Type"/> is "firstItemType"
    /// </summary>
    public bool IsFirstItemType => Type == "firstItemType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "secondItemType"
    /// </summary>
    public bool IsSecondItemType => Type == "secondItemType";

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.FirstItemType"/> if <see cref="Type"/> is 'firstItemType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'firstItemType'.</exception>
    public SeedUnions.FirstItemType AsFirstItemType() =>
        IsFirstItemType
            ? (SeedUnions.FirstItemType)Value!
            : throw new System.Exception(
                "UnionWithDuplicativeDiscriminants.Type is not 'firstItemType'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.SecondItemType"/> if <see cref="Type"/> is 'secondItemType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'secondItemType'.</exception>
    public SeedUnions.SecondItemType AsSecondItemType() =>
        IsSecondItemType
            ? (SeedUnions.SecondItemType)Value!
            : throw new System.Exception(
                "UnionWithDuplicativeDiscriminants.Type is not 'secondItemType'"
            );

    public T Match<T>(
        Func<SeedUnions.FirstItemType, T> onFirstItemType,
        Func<SeedUnions.SecondItemType, T> onSecondItemType,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "firstItemType" => onFirstItemType(AsFirstItemType()),
            "secondItemType" => onSecondItemType(AsSecondItemType()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedUnions.FirstItemType> onFirstItemType,
        Action<SeedUnions.SecondItemType> onSecondItemType,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "firstItemType":
                onFirstItemType(AsFirstItemType());
                break;
            case "secondItemType":
                onSecondItemType(AsSecondItemType());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.FirstItemType"/> and returns true if successful.
    /// </summary>
    public bool TryAsFirstItemType(out SeedUnions.FirstItemType? value)
    {
        if (Type == "firstItemType")
        {
            value = (SeedUnions.FirstItemType)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.SecondItemType"/> and returns true if successful.
    /// </summary>
    public bool TryAsSecondItemType(out SeedUnions.SecondItemType? value)
    {
        if (Type == "secondItemType")
        {
            value = (SeedUnions.SecondItemType)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithDuplicativeDiscriminants(
        UnionWithDuplicativeDiscriminants.FirstItemType value
    ) => new(value);

    public static implicit operator UnionWithDuplicativeDiscriminants(
        UnionWithDuplicativeDiscriminants.SecondItemType value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithDuplicativeDiscriminants>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(UnionWithDuplicativeDiscriminants).IsAssignableFrom(typeToConvert);

        public override UnionWithDuplicativeDiscriminants Read(
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
                "firstItemType" => json.Deserialize<SeedUnions.FirstItemType?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.FirstItemType"),
                "secondItemType" => json.Deserialize<SeedUnions.SecondItemType?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.SecondItemType"),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithDuplicativeDiscriminants(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithDuplicativeDiscriminants value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "firstItemType" => JsonSerializer.SerializeToNode(value.Value, options),
                    "secondItemType" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for firstItemType
    /// </summary>
    [Serializable]
    public struct FirstItemType
    {
        public FirstItemType(SeedUnions.FirstItemType value)
        {
            Value = value;
        }

        internal SeedUnions.FirstItemType Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithDuplicativeDiscriminants.FirstItemType(
            SeedUnions.FirstItemType value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for secondItemType
    /// </summary>
    [Serializable]
    public struct SecondItemType
    {
        public SecondItemType(SeedUnions.SecondItemType value)
        {
            Value = value;
        }

        internal SeedUnions.SecondItemType Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithDuplicativeDiscriminants.SecondItemType(
            SeedUnions.SecondItemType value
        ) => new(value);
    }
}
