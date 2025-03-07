using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(Shape.JsonConverter))]
public record Shape
{
    internal Shape(string type, object value)
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
    public object Value { get; internal set; }

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
        IsCircle ? (SeedUnions.Circle)Value : throw new Exception("Shape.Type is not 'circle'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.Square"/> if <see cref="Type"/> is 'square', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'square'.</exception>
    public SeedUnions.Square AsSquare() =>
        IsSquare ? (SeedUnions.Square)Value : throw new Exception("Shape.Type is not 'square'");

    public T Match<T>(
        Func<SeedUnions.Circle, T> onCircle,
        Func<SeedUnions.Square, T> onSquare,
        Func<string, object, T> _onUnknown
    )
    {
        return Type switch
        {
            "circle" => onCircle(AsCircle()),
            "square" => onSquare(AsSquare()),
            _ => _onUnknown(Type, Value),
        };
    }

    public void Visit(
        Action<SeedUnions.Circle> onCircle,
        Action<SeedUnions.Square> onSquare,
        Action<string, object> _onUnknown
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
                _onUnknown(Type, Value);
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
            value = (SeedUnions.Circle)Value;
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
            value = (SeedUnions.Square)Value;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    /// <summary>
    /// Base properties for the discriminated union
    /// </summary>
    internal record BaseProperties
    {
        [JsonPropertyName("id")]
        public required string Id { get; set; }
    }

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

            switch (discriminator)
            {
                case "circle":
                {
                    var value =
                        json.Deserialize<SeedUnions.Circle>(options)
                        ?? throw new JsonException("Failed to deserialize SeedUnions.Circle");
                    var baseProperties =
                        json.Deserialize<Shape.BaseProperties>(options)
                        ?? throw new JsonException("Failed to deserialize Shape.BaseProperties");
                    return new Shape("circle", value) { Id = baseProperties.Id };
                }
                case "square":
                {
                    var value =
                        json.Deserialize<SeedUnions.Square>(options)
                        ?? throw new JsonException("Failed to deserialize SeedUnions.Square");
                    var baseProperties =
                        json.Deserialize<Shape.BaseProperties>(options)
                        ?? throw new JsonException("Failed to deserialize Shape.BaseProperties");
                    return new Shape("square", value) { Id = baseProperties.Id };
                }
                default:
                    throw new JsonException(
                        $"Discriminator property 'type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            Shape value,
            JsonSerializerOptions options
        )
        {
            var jsonNode = JsonSerializer.SerializeToNode(value.Value, options);
            if (jsonNode == null)
            {
                throw new JsonException("Failed to serialize Shape");
            }

            jsonNode.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for circle
    /// </summary>
    public struct Circle
    {
        public Circle(SeedUnions.Circle value)
        {
            Value = value;
        }

        internal SeedUnions.Circle Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Circle(SeedUnions.Circle value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for square
    /// </summary>
    public struct Square
    {
        public Square(SeedUnions.Square value)
        {
            Value = value;
        }

        internal SeedUnions.Square Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Square(SeedUnions.Square value) => new(value);
    }
}
