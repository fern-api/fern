// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithSubTypes.JsonConverter))]
[Serializable]
public record UnionWithSubTypes
{
    internal UnionWithSubTypes(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithSubTypes with <see cref="UnionWithSubTypes.Foo"/>.
    /// </summary>
    public UnionWithSubTypes(UnionWithSubTypes.Foo value)
    {
        Type = "foo";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithSubTypes with <see cref="UnionWithSubTypes.FooExtended"/>.
    /// </summary>
    public UnionWithSubTypes(UnionWithSubTypes.FooExtended value)
    {
        Type = "fooExtended";
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
    /// Returns true if <see cref="Type"/> is "fooExtended"
    /// </summary>
    public bool IsFooExtended => Type == "fooExtended";

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.Foo"/> if <see cref="Type"/> is 'foo', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo'.</exception>
    public SeedUnions.Foo AsFoo() =>
        IsFoo
            ? (SeedUnions.Foo)Value!
            : throw new System.Exception("UnionWithSubTypes.Type is not 'foo'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.FooExtended"/> if <see cref="Type"/> is 'fooExtended', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'fooExtended'.</exception>
    public SeedUnions.FooExtended AsFooExtended() =>
        IsFooExtended
            ? (SeedUnions.FooExtended)Value!
            : throw new System.Exception("UnionWithSubTypes.Type is not 'fooExtended'");

    public T Match<T>(
        Func<SeedUnions.Foo, T> onFoo,
        Func<SeedUnions.FooExtended, T> onFooExtended,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "foo" => onFoo(AsFoo()),
            "fooExtended" => onFooExtended(AsFooExtended()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedUnions.Foo> onFoo,
        Action<SeedUnions.FooExtended> onFooExtended,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "foo":
                onFoo(AsFoo());
                break;
            case "fooExtended":
                onFooExtended(AsFooExtended());
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
    /// Attempts to cast the value to a <see cref="SeedUnions.FooExtended"/> and returns true if successful.
    /// </summary>
    public bool TryAsFooExtended(out SeedUnions.FooExtended? value)
    {
        if (Type == "fooExtended")
        {
            value = (SeedUnions.FooExtended)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithSubTypes(UnionWithSubTypes.Foo value) => new(value);

    public static implicit operator UnionWithSubTypes(UnionWithSubTypes.FooExtended value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithSubTypes>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithSubTypes).IsAssignableFrom(typeToConvert);

        public override UnionWithSubTypes Read(
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

            var value = discriminator switch
            {
                "foo" => json.Deserialize<SeedUnions.Foo?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.Foo"),
                "fooExtended" => json.Deserialize<SeedUnions.FooExtended?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.FooExtended"),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithSubTypes(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithSubTypes value,
            JsonSerializerOptions options
        )
        {
            JsonObject json =
                value.Type switch
                {
                    "foo" => JsonSerializer.SerializeToNode(value.Value, options) as JsonObject,
                    "fooExtended" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    _ => JsonSerializer.SerializeToNode(value.Value, options) as JsonObject,
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

        public static implicit operator UnionWithSubTypes.Foo(SeedUnions.Foo value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for fooExtended
    /// </summary>
    [Serializable]
    public struct FooExtended
    {
        public FooExtended(SeedUnions.FooExtended value)
        {
            Value = value;
        }

        internal SeedUnions.FooExtended Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithSubTypes.FooExtended(
            SeedUnions.FooExtended value
        ) => new(value);
    }
}
