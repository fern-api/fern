// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

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
    /// Returns the value as a <see cref="SeedApi.UnionWithOptionalReferenceFoo"/> if <see cref="Type"/> is 'foo', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo'.</exception>
    public SeedApi.UnionWithOptionalReferenceFoo AsFoo() =>
        IsFoo
            ? (SeedApi.UnionWithOptionalReferenceFoo)Value!
            : throw new global::System.Exception("UnionWithOptionalReference.Type is not 'foo'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithOptionalReferenceBar"/> if <see cref="Type"/> is 'bar', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'bar'.</exception>
    public SeedApi.UnionWithOptionalReferenceBar AsBar() =>
        IsBar
            ? (SeedApi.UnionWithOptionalReferenceBar)Value!
            : throw new global::System.Exception("UnionWithOptionalReference.Type is not 'bar'");

    public T Match<T>(
        Func<SeedApi.UnionWithOptionalReferenceFoo, T> onFoo,
        Func<SeedApi.UnionWithOptionalReferenceBar, T> onBar,
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
        Action<SeedApi.UnionWithOptionalReferenceFoo> onFoo,
        Action<SeedApi.UnionWithOptionalReferenceBar> onBar,
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
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithOptionalReferenceFoo"/> and returns true if successful.
    /// </summary>
    public bool TryAsFoo(out SeedApi.UnionWithOptionalReferenceFoo? value)
    {
        if (Type == "foo")
        {
            value = (SeedApi.UnionWithOptionalReferenceFoo)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithOptionalReferenceBar"/> and returns true if successful.
    /// </summary>
    public bool TryAsBar(out SeedApi.UnionWithOptionalReferenceBar? value)
    {
        if (Type == "bar")
        {
            value = (SeedApi.UnionWithOptionalReferenceBar)Value!;
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

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("type");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "foo" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithOptionalReferenceFoo?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithOptionalReferenceFoo"
                        ),
                "bar" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithOptionalReferenceBar?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithOptionalReferenceBar"
                        ),
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
                    "foo" => JsonSerializer.SerializeToNode(value.Value, options),
                    "bar" => JsonSerializer.SerializeToNode(value.Value, options),
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
    public struct Foo
    {
        public Foo(SeedApi.UnionWithOptionalReferenceFoo value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithOptionalReferenceFoo Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithOptionalReference.Foo(
            SeedApi.UnionWithOptionalReferenceFoo value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for bar
    /// </summary>
    [Serializable]
    public struct Bar
    {
        public Bar(SeedApi.UnionWithOptionalReferenceBar value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithOptionalReferenceBar Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithOptionalReference.Bar(
            SeedApi.UnionWithOptionalReferenceBar value
        ) => new(value);
    }
}
