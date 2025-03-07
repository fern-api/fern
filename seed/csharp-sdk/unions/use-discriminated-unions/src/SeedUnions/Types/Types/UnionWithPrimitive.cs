using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithPrimitive.JsonConverter))]
public record UnionWithPrimitive
{
    internal UnionWithPrimitive(string type, object value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithPrimitive with <see cref="UnionWithPrimitive.Integer"/>.
    /// </summary>
    public UnionWithPrimitive(UnionWithPrimitive.Integer value)
    {
        Type = "integer";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithPrimitive with <see cref="UnionWithPrimitive.String"/>.
    /// </summary>
    public UnionWithPrimitive(UnionWithPrimitive.String value)
    {
        Type = "string";
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

    /// <summary>
    /// Returns true if <see cref="Type"/> is "integer"
    /// </summary>
    public bool IsInteger => Type == "integer";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString => Type == "string";

    /// <summary>
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'integer', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'integer'.</exception>
    public int AsInteger() =>
        IsInteger ? (int)Value : throw new Exception("UnionWithPrimitive.Type is not 'integer'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public string AsString() =>
        IsString ? (string)Value : throw new Exception("UnionWithPrimitive.Type is not 'string'");

    public T Match<T>(
        Func<int, T> onInteger,
        Func<string, T> onString,
        Func<string, object, T> _onUnknown
    )
    {
        return Type switch
        {
            "integer" => onInteger(AsInteger()),
            "string" => onString(AsString()),
            _ => _onUnknown(Type, Value),
        };
    }

    public void Visit(
        Action<int> onInteger,
        Action<string> onString,
        Action<string, object> _onUnknown
    )
    {
        switch (Type)
        {
            case "integer":
                onInteger(AsInteger());
                break;
            case "string":
                onString(AsString());
                break;
            default:
                _onUnknown(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryAsInteger(out int? value)
    {
        if (Type == "integer")
        {
            value = (int)Value;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsString(out string? value)
    {
        if (Type == "string")
        {
            value = (string)Value;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithPrimitive(UnionWithPrimitive.Integer value) =>
        new(value);

    public static implicit operator UnionWithPrimitive(UnionWithPrimitive.String value) =>
        new(value);

    internal sealed class JsonConverter : JsonConverter<UnionWithPrimitive>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithPrimitive).IsAssignableFrom(typeToConvert);

        public override UnionWithPrimitive Read(
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
                case "integer":
                {
                    var value = json.Deserialize<int>(options);
                    return new UnionWithPrimitive("integer", value);
                }
                case "string":
                {
                    var value =
                        json.Deserialize<string>(options)
                        ?? throw new JsonException("Failed to deserialize string");
                    return new UnionWithPrimitive("string", value);
                }
                default:
                    throw new JsonException(
                        $"Discriminator property 'type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithPrimitive value,
            JsonSerializerOptions options
        )
        {
            var jsonNode = JsonSerializer.SerializeToNode(value.Value, options);
            if (jsonNode == null)
            {
                throw new JsonException("Failed to serialize UnionWithPrimitive");
            }

            jsonNode.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for integer
    /// </summary>
    public struct Integer
    {
        public Integer(int value)
        {
            Value = value;
        }

        internal int Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Integer(int value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for string
    /// </summary>
    public record String
    {
        public String(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator String(string value) => new(value);
    }
}
