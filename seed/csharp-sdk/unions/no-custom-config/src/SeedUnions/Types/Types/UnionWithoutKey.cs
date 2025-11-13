// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithoutKey.JsonConverter))]
[Serializable]
public record UnionWithoutKey
{
    internal UnionWithoutKey(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithoutKey with <see cref="UnionWithoutKey.Foo"/>.
    /// </summary>
    public UnionWithoutKey(UnionWithoutKey.Foo value)
    {
        Type = "foo";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithoutKey with <see cref="UnionWithoutKey.Bar"/>.
    /// </summary>
    public UnionWithoutKey(UnionWithoutKey.Bar value)
    {
        Type = "bar";
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
    /// Returns true if <see cref="Type"/> is "foo"
    /// </summary>
    public bool IsFoo => Type == "foo";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "bar"
    /// </summary>
    public bool IsBar => Type == "bar";

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.Foo"/> if <see cref="Type"/> is 'foo', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo'.</exception>
    public SeedUnions.Foo AsFoo() =>
        IsFoo
            ? (SeedUnions.Foo)Value!
            : throw new System.Exception("UnionWithoutKey.Type is not 'foo'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.Bar"/> if <see cref="Type"/> is 'bar', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'bar'.</exception>
    public SeedUnions.Bar AsBar() =>
        IsBar
            ? (SeedUnions.Bar)Value!
            : throw new System.Exception("UnionWithoutKey.Type is not 'bar'");

    public T Match<T>(
        Func<SeedUnions.Foo, T> onFoo,
        Func<SeedUnions.Bar, T> onBar,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "foo" => onFoo(AsFoo()),
            "bar" => onBar(AsBar()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedUnions.Foo> onFoo,
        Action<SeedUnions.Bar> onBar,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "foo":
                onFoo(AsFoo());
                break;
            case "bar":
                onBar(AsBar());
                break;
            default:
                onUnknown_(Type, Value);
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
            value = (SeedUnions.Foo)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.Bar"/> and returns true if successful.
    /// </summary>
    public bool TryAsBar(out SeedUnions.Bar? value)
    {
        if (Type == "bar")
        {
            value = (SeedUnions.Bar)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithoutKey(UnionWithoutKey.Foo value) => new(value);

    public static implicit operator UnionWithoutKey(UnionWithoutKey.Bar value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithoutKey>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(UnionWithoutKey).IsAssignableFrom(typeToConvert);

        public override UnionWithoutKey Read(
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
                "foo" => json.Deserialize<SeedUnions.Foo?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.Foo"),
                "bar" => json.Deserialize<SeedUnions.Bar?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.Bar"),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithoutKey(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithoutKey value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "foo" => JsonSerializer.SerializeToNode(value.Value, options),
                    "bar" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for foo
    /// </summary>
    [Serializable]
    public struct Foo
    {
        public Foo(SeedUnions.Foo value)
        {
            Value = value;
        }

        internal SeedUnions.Foo Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithoutKey.Foo(SeedUnions.Foo value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for bar
    /// </summary>
    [Serializable]
    public struct Bar
    {
        public Bar(SeedUnions.Bar value)
        {
            Value = value;
        }

        internal SeedUnions.Bar Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithoutKey.Bar(SeedUnions.Bar value) => new(value);
    }
}
