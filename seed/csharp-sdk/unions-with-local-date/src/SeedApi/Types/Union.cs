// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// This is a simple union.
/// </summary>
[JsonConverter(typeof(Union.JsonConverter))]
[Serializable]
public record Union
{
    internal Union(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of Union with <see cref="Union.Foo"/>.
    /// </summary>
    public Union(Union.Foo value)
    {
        Type = "foo";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Union with <see cref="Union.Bar"/>.
    /// </summary>
    public Union(Union.Bar value)
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
    /// Returns the value as a <see cref="SeedApi.UnionFoo"/> if <see cref="Type"/> is 'foo', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo'.</exception>
    public SeedApi.UnionFoo AsFoo() =>
        IsFoo
            ? (SeedApi.UnionFoo)Value!
            : throw new global::System.Exception("Union.Type is not 'foo'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionBar"/> if <see cref="Type"/> is 'bar', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'bar'.</exception>
    public SeedApi.UnionBar AsBar() =>
        IsBar
            ? (SeedApi.UnionBar)Value!
            : throw new global::System.Exception("Union.Type is not 'bar'");

    public T Match<T>(
        Func<SeedApi.UnionFoo, T> onFoo,
        Func<SeedApi.UnionBar, T> onBar,
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
        Action<SeedApi.UnionFoo> onFoo,
        Action<SeedApi.UnionBar> onBar,
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
    /// Attempts to cast the value to a <see cref="SeedApi.UnionFoo"/> and returns true if successful.
    /// </summary>
    public bool TryAsFoo(out SeedApi.UnionFoo? value)
    {
        if (Type == "foo")
        {
            value = (SeedApi.UnionFoo)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionBar"/> and returns true if successful.
    /// </summary>
    public bool TryAsBar(out SeedApi.UnionBar? value)
    {
        if (Type == "bar")
        {
            value = (SeedApi.UnionBar)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator Union(Union.Foo value) => new(value);

    public static implicit operator Union(Union.Bar value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Union>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Union).IsAssignableFrom(typeToConvert);

        public override Union Read(
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

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("type");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "foo" => jsonWithoutDiscriminator.Deserialize<SeedApi.UnionFoo?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.UnionFoo"),
                "bar" => jsonWithoutDiscriminator.Deserialize<SeedApi.UnionBar?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.UnionBar"),
                _ => json.Deserialize<object?>(options),
            };
            return new Union(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            Union value,
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

        public override Union ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new Union(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Union value,
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
    public struct Foo
    {
        public Foo(SeedApi.UnionFoo value)
        {
            Value = value;
        }

        internal SeedApi.UnionFoo Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Union.Foo(SeedApi.UnionFoo value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for bar
    /// </summary>
    [Serializable]
    public struct Bar
    {
        public Bar(SeedApi.UnionBar value)
        {
            Value = value;
        }

        internal SeedApi.UnionBar Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator Union.Bar(SeedApi.UnionBar value) => new(value);
    }
}
