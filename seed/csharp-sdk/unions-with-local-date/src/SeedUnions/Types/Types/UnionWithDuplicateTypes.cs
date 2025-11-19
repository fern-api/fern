// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithDuplicateTypes.JsonConverter))]
[Serializable]
public record UnionWithDuplicateTypes
{
    internal UnionWithDuplicateTypes(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicateTypes with <see cref="UnionWithDuplicateTypes.Foo1"/>.
    /// </summary>
    public UnionWithDuplicateTypes(UnionWithDuplicateTypes.Foo1 value)
    {
        Type = "foo1";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicateTypes with <see cref="UnionWithDuplicateTypes.Foo2"/>.
    /// </summary>
    public UnionWithDuplicateTypes(UnionWithDuplicateTypes.Foo2 value)
    {
        Type = "foo2";
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
    /// Returns true if <see cref="Type"/> is "foo1"
    /// </summary>
    public bool IsFoo1 => Type == "foo1";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "foo2"
    /// </summary>
    public bool IsFoo2 => Type == "foo2";

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.Foo"/> if <see cref="Type"/> is 'foo1', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo1'.</exception>
    public SeedUnions.Foo AsFoo1() =>
        IsFoo1
            ? (SeedUnions.Foo)Value!
            : throw new System.Exception("UnionWithDuplicateTypes.Type is not 'foo1'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.Foo"/> if <see cref="Type"/> is 'foo2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo2'.</exception>
    public SeedUnions.Foo AsFoo2() =>
        IsFoo2
            ? (SeedUnions.Foo)Value!
            : throw new System.Exception("UnionWithDuplicateTypes.Type is not 'foo2'");

    public T Match<T>(
        Func<SeedUnions.Foo, T> onFoo1,
        Func<SeedUnions.Foo, T> onFoo2,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "foo1" => onFoo1(AsFoo1()),
            "foo2" => onFoo2(AsFoo2()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedUnions.Foo> onFoo1,
        Action<SeedUnions.Foo> onFoo2,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "foo1":
                onFoo1(AsFoo1());
                break;
            case "foo2":
                onFoo2(AsFoo2());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.Foo"/> and returns true if successful.
    /// </summary>
    public bool TryAsFoo1(out SeedUnions.Foo? value)
    {
        if (Type == "foo1")
        {
            value = (SeedUnions.Foo)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUnions.Foo"/> and returns true if successful.
    /// </summary>
    public bool TryAsFoo2(out SeedUnions.Foo? value)
    {
        if (Type == "foo2")
        {
            value = (SeedUnions.Foo)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithDuplicateTypes(UnionWithDuplicateTypes.Foo1 value) =>
        new(value);

    public static implicit operator UnionWithDuplicateTypes(UnionWithDuplicateTypes.Foo2 value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithDuplicateTypes>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(UnionWithDuplicateTypes).IsAssignableFrom(typeToConvert);

        public override UnionWithDuplicateTypes Read(
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
                "foo1" => json.Deserialize<SeedUnions.Foo?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.Foo"),
                "foo2" => json.Deserialize<SeedUnions.Foo?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.Foo"),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithDuplicateTypes(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithDuplicateTypes value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "foo1" => JsonSerializer.SerializeToNode(value.Value, options),
                    "foo2" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for foo1
    /// </summary>
    [Serializable]
    public struct Foo1
    {
        public Foo1(SeedUnions.Foo value)
        {
            Value = value;
        }

        internal SeedUnions.Foo Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithDuplicateTypes.Foo1(SeedUnions.Foo value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for foo2
    /// </summary>
    [Serializable]
    public struct Foo2
    {
        public Foo2(SeedUnions.Foo value)
        {
            Value = value;
        }

        internal SeedUnions.Foo Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithDuplicateTypes.Foo2(SeedUnions.Foo value) =>
            new(value);
    }
}
