// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithOptionalReference.JsonConverter))]
[Serializable]
public record UnionWithOptionalReference
{
    internal UnionWithOptionalReference(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithOptionalReference with <see cref="UnionWithOptionalReference.Foo"/>.
    /// </summary>
    public UnionWithOptionalReference(UnionWithOptionalReference.Foo value)
    {
        Type = "foo";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithOptionalReference with <see cref="UnionWithOptionalReference.Bar"/>.
    /// </summary>
    public UnionWithOptionalReference(UnionWithOptionalReference.Bar value)
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
    /// Returns the value as a <see cref="Foo?"/> if <see cref="Type"/> is 'foo', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo'.</exception>
    public Foo? AsFoo() =>
        IsFoo
            ? (Foo?)Value!
            : throw new global::System.Exception("UnionWithOptionalReference.Type is not 'foo'");

    /// <summary>
    /// Returns the value as a <see cref="Bar?"/> if <see cref="Type"/> is 'bar', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'bar'.</exception>
    public Bar? AsBar() =>
        IsBar
            ? (Bar?)Value!
            : throw new global::System.Exception("UnionWithOptionalReference.Type is not 'bar'");

    public T Match<T>(Func<Foo?, T> onFoo, Func<Bar?, T> onBar, Func<string, object?, T> onUnknown_)
    {
        return Type switch
        {
            "foo" => onFoo(AsFoo()),
            "bar" => onBar(AsBar()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(Action<Foo?> onFoo, Action<Bar?> onBar, Action<string, object?> onUnknown_)
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
    /// Attempts to cast the value to a <see cref="Foo?"/> and returns true if successful.
    /// </summary>
    public bool TryAsFoo(out Foo? value)
    {
        if (Type == "foo")
        {
            value = (Foo?)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="Bar?"/> and returns true if successful.
    /// </summary>
    public bool TryAsBar(out Bar? value)
    {
        if (Type == "bar")
        {
            value = (Bar?)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithOptionalReference(
        UnionWithOptionalReference.Foo value
    ) => new(value);

    public static implicit operator UnionWithOptionalReference(
        UnionWithOptionalReference.Bar value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithOptionalReference>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithOptionalReference).IsAssignableFrom(typeToConvert);

        public override UnionWithOptionalReference Read(
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
                "foo" => json.GetProperty("value").Deserialize<Foo?>(options),
                "bar" => json.GetProperty("value").Deserialize<Bar?>(options),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithOptionalReference(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithOptionalReference value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "foo" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "bar" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override UnionWithOptionalReference ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new UnionWithOptionalReference(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithOptionalReference value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for foo
    /// </summary>
    [Serializable]
    public record Foo
    {
        public Foo(Foo? value)
        {
            Value = value;
        }

        internal Foo? Value { get; set; }

        public override string ToString() => Value?.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for bar
    /// </summary>
    [Serializable]
    public record Bar
    {
        public Bar(Bar? value)
        {
            Value = value;
        }

        internal Bar? Value { get; set; }

        public override string ToString() => Value?.ToString() ?? "null";
    }
}
