// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(Shape.JsonConverter))]
[Serializable]
public record Shape
{
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

    /// <summary>
    /// Returns true if <see cref="Type"/> is "circle"
    /// </summary>
    public bool IsCircle => Type == "circle";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "square"
    /// </summary>
    public bool IsSquare => Type == "square";

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.Circle"/> if <see cref="Type"/> is 'circle', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'circle'.</exception>
    public SeedUnions.Circle AsCircle() =>
        IsCircle
            ? (SeedUnions.Circle)Value!
            : throw new System.Exception("Shape.Type is not 'circle'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.Square"/> if <see cref="Type"/> is 'square', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'square'.</exception>
    public SeedUnions.Square AsSquare() =>
        IsSquare
            ? (SeedUnions.Square)Value!
            : throw new System.Exception("Shape.Type is not 'square'");

    public T Match<T>(
        Func<SeedUnions.Circle, T> onCircle,
        Func<SeedUnions.Square, T> onSquare,
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
        Action<SeedUnions.Circle> onCircle,
        Action<SeedUnions.Square> onSquare,
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
    /// Attempts to cast the value to a <see cref="SeedUnions.Circle"/> and returns true if successful.
    /// </summary>
    public bool TryAsCircle(out SeedUnions.Circle? value)
    {
        if (Type == "circle")
        {
            value = (SeedUnions.Circle)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.Square"/> and returns true if successful.
    /// </summary>
    public bool TryAsSquare(out SeedUnions.Square? value)
    {
        if (Type == "square")
        {
            value = (SeedUnions.Square)Value!;
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
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Shape>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(Shape).IsAssignableFrom(typeToConvert);

        public override Shape Read(
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
                "circle" => json.Deserialize<SeedUnions.Circle?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.Circle"),
                "square" => json.Deserialize<SeedUnions.Square?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.Square"),
                _ => json.Deserialize<object?>(options),
            };
            var baseProperties =
                json.Deserialize<Shape.BaseProperties>(options)
                ?? throw new JsonException("Failed to deserialize Shape.BaseProperties");
            return new Shape(discriminator, value) { Id = baseProperties.Id };
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
                JsonSerializer.SerializeToNode(new Shape.BaseProperties { Id = value.Id }, options)
                ?? throw new JsonException("Failed to serialize Shape.BaseProperties");
            foreach (var property in basePropertiesJson.AsObject())
            {
                json[property.Key] = property.Value;
            }
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for circle
    /// </summary>
    [Serializable]
    public struct Circle
    {
        public Circle(SeedUnions.Circle value)
        {
            Value = value;
        }

        internal SeedUnions.Circle Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Shape.Circle(SeedUnions.Circle value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for square
    /// </summary>
    [Serializable]
    public struct Square
    {
        public Square(SeedUnions.Square value)
        {
            Value = value;
        }

        internal SeedUnions.Square Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Shape.Square(SeedUnions.Square value) => new(value);
    }
}
