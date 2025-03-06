using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithLiteral.JsonConverter))]
public record UnionWithLiteral
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of UnionWithLiteral with <see cref="string"/>.
    /// </summary>
    public UnionWithLiteral(string value)
    {
        Type = "fern";
        Value = value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    [JsonIgnore]
    public object Value { get; internal set; }

    [JsonPropertyName("base")]
    public string Base { get; set; } = "base";

    /// <summary>
    /// Returns true if of type <see cref="string"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsFern => Type == "fern";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="string"/>.</exception>
    public string AsFern() => (string)Value;

    public T Match<T>(Func<string, T> onFern)
    {
        return Type switch
        {
            "fern" => onFern(AsFern()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<string> onFern)
    {
        switch (Type)
        {
            case "fern":
                onFern(AsFern());
                break;
            default:
                throw new Exception($"Unexpected Type: {Type}");
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsFern(out string? value)
    {
        if (Value is string asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    internal sealed class JsonConverter : JsonConverter<UnionWithLiteral>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithLiteral).IsAssignableFrom(typeToConvert);

        public override UnionWithLiteral Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var jsonObject = JsonElement.ParseValue(ref reader);
            if (!jsonObject.TryGetProperty("type", out var discriminatorElement))
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

            switch (discriminator)
            {
                case "fern":
                {
                    var value =
                        jsonObject.Deserialize<string>()
                        ?? throw new JsonException("Failed to deserialize string");
                    return new UnionWithLiteral(value);
                }
                default:
                    throw new JsonException(
                        $"Discriminator property 'type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithLiteral value,
            JsonSerializerOptions options
        )
        {
            var jsonNode = JsonSerializer.SerializeToNode(value.Value, options);
            if (jsonNode == null)
            {
                throw new JsonException("Failed to serialize UnionWithLiteral");
            }

            jsonNode.WriteTo(writer, options);
        }
    }
}
