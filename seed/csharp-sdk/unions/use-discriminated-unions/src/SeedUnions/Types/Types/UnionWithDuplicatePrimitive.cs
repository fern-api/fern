using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithDuplicatePrimitive.JsonConverter))]
public record UnionWithDuplicatePrimitive
{
    internal UnionWithDuplicatePrimitive(string type, object value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicatePrimitive with <see cref="UnionWithDuplicatePrimitive.Integer1"/>.
    /// </summary>
    public UnionWithDuplicatePrimitive(UnionWithDuplicatePrimitive.Integer1 value)
    {
        Type = "integer1";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicatePrimitive with <see cref="UnionWithDuplicatePrimitive.Integer2"/>.
    /// </summary>
    public UnionWithDuplicatePrimitive(UnionWithDuplicatePrimitive.Integer2 value)
    {
        Type = "integer2";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicatePrimitive with <see cref="UnionWithDuplicatePrimitive.String1"/>.
    /// </summary>
    public UnionWithDuplicatePrimitive(UnionWithDuplicatePrimitive.String1 value)
    {
        Type = "string1";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicatePrimitive with <see cref="UnionWithDuplicatePrimitive.String2"/>.
    /// </summary>
    public UnionWithDuplicatePrimitive(UnionWithDuplicatePrimitive.String2 value)
    {
        Type = "string2";
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
    /// Returns true if <see cref="Type"/> is "integer1"
    /// </summary>
    public bool IsInteger1 => Type == "integer1";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "integer2"
    /// </summary>
    public bool IsInteger2 => Type == "integer2";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string1"
    /// </summary>
    public bool IsString1 => Type == "string1";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string2"
    /// </summary>
    public bool IsString2 => Type == "string2";

    /// <summary>
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'integer1', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'integer1'.</exception>
    public int AsInteger1() =>
        IsInteger1
            ? (int)Value
            : throw new Exception("UnionWithDuplicatePrimitive.Type is not 'integer1'");

    /// <summary>
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'integer2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'integer2'.</exception>
    public int AsInteger2() =>
        IsInteger2
            ? (int)Value
            : throw new Exception("UnionWithDuplicatePrimitive.Type is not 'integer2'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string1', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'string1'.</exception>
    public string AsString1() =>
        IsString1
            ? (string)Value
            : throw new Exception("UnionWithDuplicatePrimitive.Type is not 'string1'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'string2'.</exception>
    public string AsString2() =>
        IsString2
            ? (string)Value
            : throw new Exception("UnionWithDuplicatePrimitive.Type is not 'string2'");

    public T Match<T>(
        Func<int, T> onInteger1,
        Func<int, T> onInteger2,
        Func<string, T> onString1,
        Func<string, T> onString2,
        Func<string, object, T> _onUnknown
    )
    {
        return Type switch
        {
            "integer1" => onInteger1(AsInteger1()),
            "integer2" => onInteger2(AsInteger2()),
            "string1" => onString1(AsString1()),
            "string2" => onString2(AsString2()),
            _ => _onUnknown(Type, Value),
        };
    }

    public void Visit(
        Action<int> onInteger1,
        Action<int> onInteger2,
        Action<string> onString1,
        Action<string> onString2,
        Action<string, object> _onUnknown
    )
    {
        switch (Type)
        {
            case "integer1":
                onInteger1(AsInteger1());
                break;
            case "integer2":
                onInteger2(AsInteger2());
                break;
            case "string1":
                onString1(AsString1());
                break;
            case "string2":
                onString2(AsString2());
                break;
            default:
                _onUnknown(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryAsInteger1(out int? value)
    {
        if (Type == "integer1")
        {
            value = (int)Value;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryAsInteger2(out int? value)
    {
        if (Type == "integer2")
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
    public bool TryAsString1(out string? value)
    {
        if (Type == "string1")
        {
            value = (string)Value;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsString2(out string? value)
    {
        if (Type == "string2")
        {
            value = (string)Value;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithDuplicatePrimitive(
        UnionWithDuplicatePrimitive.Integer1 value
    ) => new(value);

    public static implicit operator UnionWithDuplicatePrimitive(
        UnionWithDuplicatePrimitive.Integer2 value
    ) => new(value);

    public static implicit operator UnionWithDuplicatePrimitive(
        UnionWithDuplicatePrimitive.String1 value
    ) => new(value);

    public static implicit operator UnionWithDuplicatePrimitive(
        UnionWithDuplicatePrimitive.String2 value
    ) => new(value);

    internal sealed class JsonConverter : JsonConverter<UnionWithDuplicatePrimitive>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithDuplicatePrimitive).IsAssignableFrom(typeToConvert);

        public override UnionWithDuplicatePrimitive Read(
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
                case "integer1":
                {
                    var value = json.Deserialize<int>(options);
                    return new UnionWithDuplicatePrimitive("integer1", value);
                }
                case "integer2":
                {
                    var value = json.Deserialize<int>(options);
                    return new UnionWithDuplicatePrimitive("integer2", value);
                }
                case "string1":
                {
                    var value =
                        json.Deserialize<string>(options)
                        ?? throw new JsonException("Failed to deserialize string");
                    return new UnionWithDuplicatePrimitive("string1", value);
                }
                case "string2":
                {
                    var value =
                        json.Deserialize<string>(options)
                        ?? throw new JsonException("Failed to deserialize string");
                    return new UnionWithDuplicatePrimitive("string2", value);
                }
                default:
                    throw new JsonException(
                        $"Discriminator property 'type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithDuplicatePrimitive value,
            JsonSerializerOptions options
        )
        {
            var jsonNode = JsonSerializer.SerializeToNode(value.Value, options);
            if (jsonNode == null)
            {
                throw new JsonException("Failed to serialize UnionWithDuplicatePrimitive");
            }

            jsonNode.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for integer1
    /// </summary>
    public struct Integer1
    {
        public Integer1(int value)
        {
            Value = value;
        }

        internal int Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Integer1(int value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for integer2
    /// </summary>
    public struct Integer2
    {
        public Integer2(int value)
        {
            Value = value;
        }

        internal int Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Integer2(int value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for string1
    /// </summary>
    public record String1
    {
        public String1(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator String1(string value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for string2
    /// </summary>
    public record String2
    {
        public String2(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator String2(string value) => new(value);
    }
}
