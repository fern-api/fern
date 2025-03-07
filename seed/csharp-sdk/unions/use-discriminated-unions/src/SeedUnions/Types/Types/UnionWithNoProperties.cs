using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithNoProperties.JsonConverter))]
public record UnionWithNoProperties
{
    internal UnionWithNoProperties(string type, object value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithNoProperties with <see cref="UnionWithNoProperties.Foo"/>.
    /// </summary>
    public UnionWithNoProperties(UnionWithNoProperties.Foo value)
    {
        Type = "foo";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithNoProperties with <see cref="UnionWithNoProperties.Empty"/>.
    /// </summary>
    public UnionWithNoProperties(UnionWithNoProperties.Empty value)
    {
        Type = "empty";
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
    /// Returns true if <see cref="Type"/> is "foo"
    /// </summary>
    public bool IsFoo => Type == "foo";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "empty"
    /// </summary>
    public bool IsEmpty => Type == "empty";

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.Foo"/> if <see cref="Type"/> is 'foo', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo'.</exception>
    public SeedUnions.Foo AsFoo() =>
        IsFoo
            ? (SeedUnions.Foo)Value
            : throw new Exception("UnionWithNoProperties.Type is not 'foo'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'empty', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'empty'.</exception>
    public object AsEmpty() =>
        IsEmpty ? Value : throw new Exception("UnionWithNoProperties.Type is not 'empty'");

    public T Match<T>(
        Func<SeedUnions.Foo, T> onFoo,
        Func<object, T> onEmpty,
        Func<string, object, T> _onUnknown
    )
    {
        return Type switch
        {
            "foo" => onFoo(AsFoo()),
            "empty" => onEmpty(AsEmpty()),
            _ => _onUnknown(Type, Value),
        };
    }

    public void Visit(
        Action<SeedUnions.Foo> onFoo,
        Action<object> onEmpty,
        Action<string, object> _onUnknown
    )
    {
        switch (Type)
        {
            case "foo":
                onFoo(AsFoo());
                break;
            case "empty":
                onEmpty(AsEmpty());
                break;
            default:
                _onUnknown(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.Foo"/> and returns true if successful.
    /// </summary>
    public bool TryAsFoo(out SeedUnions.Foo? value)
    {
        if (Type == "foo")
        {
            value = (SeedUnions.Foo)Value;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsEmpty(out object? value)
    {
        if (Type == "empty")
        {
            value = Value;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithNoProperties(UnionWithNoProperties.Foo value) =>
        new(value);

    internal sealed class JsonConverter : JsonConverter<UnionWithNoProperties>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithNoProperties).IsAssignableFrom(typeToConvert);

        public override UnionWithNoProperties Read(
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
                case "foo":
                {
                    var value =
                        json.Deserialize<SeedUnions.Foo>(options)
                        ?? throw new JsonException("Failed to deserialize SeedUnions.Foo");
                    return new UnionWithNoProperties("foo", value);
                }
                case "empty":
                {
                    var value =
                        json.Deserialize<object>(options)
                        ?? throw new JsonException("Failed to deserialize object");
                    return new UnionWithNoProperties("empty", value);
                }
                default:
                    throw new JsonException(
                        $"Discriminator property 'type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithNoProperties value,
            JsonSerializerOptions options
        )
        {
            var jsonNode = JsonSerializer.SerializeToNode(value.Value, options);
            if (jsonNode == null)
            {
                throw new JsonException("Failed to serialize UnionWithNoProperties");
            }

            jsonNode.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for foo
    /// </summary>
    public struct Foo
    {
        public Foo(SeedUnions.Foo value)
        {
            Value = value;
        }

        internal SeedUnions.Foo Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Foo(SeedUnions.Foo value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for empty
    /// </summary>
    public record Empty
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString();
    }
}
