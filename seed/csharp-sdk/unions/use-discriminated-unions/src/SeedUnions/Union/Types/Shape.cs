using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(Shape.JsonConverter))]
public record Shape
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of Shape with <see cref="Circle"/>.
    /// </summary>
    public Shape(Circle value)
    {
        Type = "circle";
        Value = value;
    }

    /// <summary>
    /// Create an instance of Shape with <see cref="Square"/>.
    /// </summary>
    public Shape(Square value)
    {
        Type = "square";
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

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    /// <summary>
    /// Returns true if of type <see cref="Circle"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsCircle => Type == "circle";

    /// <summary>
    /// Returns true if of type <see cref="Square"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsSquare => Type == "square";

    /// <summary>
    /// Returns the value as a <see cref="Circle"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Circle"/>.</exception>
    public Circle AsCircle() => (Circle)Value;

    /// <summary>
    /// Returns the value as a <see cref="Square"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Square"/>.</exception>
    public Square AsSquare() => (Square)Value;

    public T Match<T>(Func<Circle, T> onCircle, Func<Square, T> onSquare)
    {
        return Type switch
        {
            "circle" => onCircle(AsCircle()),
            "square" => onSquare(AsSquare()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<Circle> onCircle, Action<Square> onSquare)
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
                throw new Exception($"Unexpected Type: {Type}");
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="Circle"/> and returns true if successful.
    /// </summary>
    public bool TryAsCircle(out Circle? value)
    {
        if (Value is Circle asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="Square"/> and returns true if successful.
    /// </summary>
    public bool TryAsSquare(out Square? value)
    {
        if (Value is Square asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

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
                case "circle":
                {
                    var value = jsonObject.Deserialize<Circle>();
                    return new Shape(value);
                }
                case "square":
                {
                    var value = jsonObject.Deserialize<Square>();
                    return new Shape(value);
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
}
