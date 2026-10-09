// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Diagnostics.CodeAnalysis;
using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedCsharpUnionBaseProperties.Core;

namespace SeedCsharpUnionBaseProperties;

[JsonConverter(typeof(Shape.JsonConverter))]
[Serializable]
public record Shape
{
    [SetsRequiredMembers]
    internal Shape(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of Shape with <see cref="Shape.Circle"/>.
    /// </summary>
    public Shape(Shape.Circle value)
    {
        Type = "circle";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Shape with <see cref="Shape.Square"/>.
    /// </summary>
    public Shape(Shape.Square value)
    {
        Type = "square";
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

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    [JsonPropertyName("createdAt")]
    public string? CreatedAt { get; set; }

    /// <summary>
    /// Returns true if <see cref="Type"/> is "circle"
    /// </summary>
    public bool IsCircle => Type == "circle";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "square"
    /// </summary>
    public bool IsSquare => Type == "square";

    /// <summary>
    /// Returns the value as a <see cref="SeedCsharpUnionBaseProperties.Circle"/> if <see cref="Type"/> is 'circle', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'circle'.</exception>
    public SeedCsharpUnionBaseProperties.Circle AsCircle() =>
        IsCircle
            ? (SeedCsharpUnionBaseProperties.Circle)Value!
            : throw new global::System.Exception("Shape.Type is not 'circle'");

    /// <summary>
    /// Returns the value as a <see cref="SeedCsharpUnionBaseProperties.Square"/> if <see cref="Type"/> is 'square', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'square'.</exception>
    public SeedCsharpUnionBaseProperties.Square AsSquare() =>
        IsSquare
            ? (SeedCsharpUnionBaseProperties.Square)Value!
            : throw new global::System.Exception("Shape.Type is not 'square'");

    public T Match<T>(
        Func<SeedCsharpUnionBaseProperties.Circle, T> onCircle,
        Func<SeedCsharpUnionBaseProperties.Square, T> onSquare,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "circle" => onCircle(AsCircle()),
            "square" => onSquare(AsSquare()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedCsharpUnionBaseProperties.Circle> onCircle,
        Action<SeedCsharpUnionBaseProperties.Square> onSquare,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "circle":
                onCircle(AsCircle());
                break;
            case "square":
                onSquare(AsSquare());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedCsharpUnionBaseProperties.Circle"/> and returns true if successful.
    /// </summary>
    public bool TryAsCircle(out SeedCsharpUnionBaseProperties.Circle? value)
    {
        if (Type == "circle")
        {
            value = (SeedCsharpUnionBaseProperties.Circle)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedCsharpUnionBaseProperties.Square"/> and returns true if successful.
    /// </summary>
    public bool TryAsSquare(out SeedCsharpUnionBaseProperties.Square? value)
    {
        if (Type == "square")
        {
            value = (SeedCsharpUnionBaseProperties.Square)Value!;
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
        [JsonPropertyName("id")]
        public required string Id { get; set; }

        [JsonPropertyName("createdAt")]
        public string? CreatedAt { get; set; }
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Shape>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Shape).IsAssignableFrom(typeToConvert);

        public override Shape Read(
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

            // Strip properties owned by the union (discriminant and base properties) to prevent them from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("type");
            jsonObject?.Remove("id");
            jsonObject?.Remove("createdAt");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "circle" =>
                    jsonWithoutDiscriminator.Deserialize<SeedCsharpUnionBaseProperties.Circle?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedCsharpUnionBaseProperties.Circle"
                        ),
                "square" =>
                    jsonWithoutDiscriminator.Deserialize<SeedCsharpUnionBaseProperties.Square?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedCsharpUnionBaseProperties.Square"
                        ),
                _ => json.Deserialize<object?>(options),
            };
            var baseProperties =
                json.Deserialize<Shape.BaseProperties>(options)
                ?? throw new JsonException("Failed to deserialize Shape.BaseProperties");
            return new Shape(discriminator, value)
            {
                Id = baseProperties.Id,
                CreatedAt = baseProperties.CreatedAt,
            };
        }

        public override void Write(
            Utf8JsonWriter writer,
            Shape value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "circle" => JsonSerializer.SerializeToNode(value.Value, options),
                    "square" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            var basePropertiesJson =
                JsonSerializer.SerializeToNode(
                    new Shape.BaseProperties { Id = value.Id, CreatedAt = value.CreatedAt },
                    options
                ) ?? throw new JsonException("Failed to serialize Shape.BaseProperties");
            foreach (var property in basePropertiesJson.AsObject())
            {
                json[property.Key] = property.Value;
            }
            json.WriteTo(writer, options);
        }

        public override Shape ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new Shape(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Shape value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for circle
    /// </summary>
    [Serializable]
    public struct Circle
    {
        public Circle(SeedCsharpUnionBaseProperties.Circle value)
        {
            Value = value;
        }

        internal SeedCsharpUnionBaseProperties.Circle Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Shape.Circle(SeedCsharpUnionBaseProperties.Circle value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for square
    /// </summary>
    [Serializable]
    public struct Square
    {
        public Square(SeedCsharpUnionBaseProperties.Square value)
        {
            Value = value;
        }

        internal SeedCsharpUnionBaseProperties.Square Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Shape.Square(SeedCsharpUnionBaseProperties.Square value) =>
            new(value);
    }
}
