// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithMultipleNoProperties.JsonConverter))]
[Serializable]
public record UnionWithMultipleNoProperties
{
    internal UnionWithMultipleNoProperties(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithMultipleNoProperties with <see cref="UnionWithMultipleNoProperties.Foo"/>.
    /// </summary>
    public UnionWithMultipleNoProperties(UnionWithMultipleNoProperties.Foo value)
    {
        Type = "foo";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithMultipleNoProperties with <see cref="UnionWithMultipleNoProperties.Empty1"/>.
    /// </summary>
    public UnionWithMultipleNoProperties(UnionWithMultipleNoProperties.Empty1 value)
    {
        Type = "empty1";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithMultipleNoProperties with <see cref="UnionWithMultipleNoProperties.Empty2"/>.
    /// </summary>
    public UnionWithMultipleNoProperties(UnionWithMultipleNoProperties.Empty2 value)
    {
        Type = "empty2";
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
    /// Returns true if <see cref="Type"/> is "empty1"
    /// </summary>
    public bool IsEmpty1 => Type == "empty1";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "empty2"
    /// </summary>
    public bool IsEmpty2 => Type == "empty2";

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.Foo"/> if <see cref="Type"/> is 'foo', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo'.</exception>
    public SeedUnions.Foo AsFoo() =>
        IsFoo
            ? (SeedUnions.Foo)Value!
            : throw new System.Exception("UnionWithMultipleNoProperties.Type is not 'foo'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'empty1', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'empty1'.</exception>
    public object AsEmpty1() =>
        IsEmpty1
            ? Value!
            : throw new System.Exception("UnionWithMultipleNoProperties.Type is not 'empty1'");

    /// <summary>
    /// Returns the value as a <see cref="object"/> if <see cref="Type"/> is 'empty2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'empty2'.</exception>
    public object AsEmpty2() =>
        IsEmpty2
            ? Value!
            : throw new System.Exception("UnionWithMultipleNoProperties.Type is not 'empty2'");

    public T Match<T>(
        Func<SeedUnions.Foo, T> onFoo,
        Func<object, T> onEmpty1,
        Func<object, T> onEmpty2,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "foo" => onFoo(AsFoo()),
            "empty1" => onEmpty1(AsEmpty1()),
            "empty2" => onEmpty2(AsEmpty2()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedUnions.Foo> onFoo,
        Action<object> onEmpty1,
        Action<object> onEmpty2,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "foo":
                onFoo(AsFoo());
                break;
            case "empty1":
                onEmpty1(AsEmpty1());
                break;
            case "empty2":
                onEmpty2(AsEmpty2());
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
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsEmpty1(out object? value)
    {
        if (Type == "empty1")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsEmpty2(out object? value)
    {
        if (Type == "empty2")
        {
            value = Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithMultipleNoProperties(
        UnionWithMultipleNoProperties.Foo value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithMultipleNoProperties>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithMultipleNoProperties).IsAssignableFrom(typeToConvert);

        public override UnionWithMultipleNoProperties Read(
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
                "empty1" => new { },
                "empty2" => new { },
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithMultipleNoProperties(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithMultipleNoProperties value,
            JsonSerializerOptions options
        )
        {
            JsonObject json =
                value.Type switch
                {
                    "foo" => JsonSerializer.SerializeToNode(value.Value, options) as JsonObject,
                    "empty1" => new JsonObject(),
                    "empty2" => new JsonObject(),
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

        public static implicit operator UnionWithMultipleNoProperties.Foo(SeedUnions.Foo value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for empty1
    /// </summary>
    [Serializable]
    public record Empty1
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for empty2
    /// </summary>
    [Serializable]
    public record Empty2
    {
        internal object Value => new { };

        public override string ToString() => Value.ToString() ?? "null";
    }
}
