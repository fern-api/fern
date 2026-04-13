// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithDiscriminant.JsonConverter))]
[Serializable]
public record UnionWithDiscriminant
{
    internal UnionWithDiscriminant(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithDiscriminant with <see cref="UnionWithDiscriminant.Foo"/>.
    /// </summary>
    public UnionWithDiscriminant(UnionWithDiscriminant.Foo value)
    {
        Type = "foo";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithDiscriminant with <see cref="UnionWithDiscriminant.Bar"/>.
    /// </summary>
    public UnionWithDiscriminant(UnionWithDiscriminant.Bar value)
    {
        Type = "bar";
        Value = value.Value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("_type")]
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
    /// Returns the value as a <see cref="SeedApi.UnionWithDiscriminantFoo"/> if <see cref="Type"/> is 'foo', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo'.</exception>
    public SeedApi.UnionWithDiscriminantFoo AsFoo() =>
        IsFoo
            ? (SeedApi.UnionWithDiscriminantFoo)Value!
            : throw new global::System.Exception("UnionWithDiscriminant.Type is not 'foo'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithDiscriminantBar"/> if <see cref="Type"/> is 'bar', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'bar'.</exception>
    public SeedApi.UnionWithDiscriminantBar AsBar() =>
        IsBar
            ? (SeedApi.UnionWithDiscriminantBar)Value!
            : throw new global::System.Exception("UnionWithDiscriminant.Type is not 'bar'");

    public T Match<T>(
        Func<SeedApi.UnionWithDiscriminantFoo, T> onFoo,
        Func<SeedApi.UnionWithDiscriminantBar, T> onBar,
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
        Action<SeedApi.UnionWithDiscriminantFoo> onFoo,
        Action<SeedApi.UnionWithDiscriminantBar> onBar,
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
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithDiscriminantFoo"/> and returns true if successful.
    /// </summary>
    public bool TryAsFoo(out SeedApi.UnionWithDiscriminantFoo? value)
    {
        if (Type == "foo")
        {
            value = (SeedApi.UnionWithDiscriminantFoo)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithDiscriminantBar"/> and returns true if successful.
    /// </summary>
    public bool TryAsBar(out SeedApi.UnionWithDiscriminantBar? value)
    {
        if (Type == "bar")
        {
            value = (SeedApi.UnionWithDiscriminantBar)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithDiscriminant(UnionWithDiscriminant.Foo value) =>
        new(value);

    public static implicit operator UnionWithDiscriminant(UnionWithDiscriminant.Bar value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithDiscriminant>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithDiscriminant).IsAssignableFrom(typeToConvert);

        public override UnionWithDiscriminant Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var json = JsonElement.ParseValue(ref reader);
            if (!json.TryGetProperty("_type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property '_type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property '_type' is null");
                }

                throw new JsonException(
                    $"Discriminator property '_type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property '_type' is null");

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("_type");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "foo" => jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithDiscriminantFoo?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedApi.UnionWithDiscriminantFoo"
                    ),
                "bar" => jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithDiscriminantBar?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedApi.UnionWithDiscriminantBar"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithDiscriminant(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithDiscriminant value,
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
            json["_type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override UnionWithDiscriminant ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new UnionWithDiscriminant(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithDiscriminant value,
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
        public Foo(SeedApi.UnionWithDiscriminantFoo value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithDiscriminantFoo Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithDiscriminant.Foo(
            SeedApi.UnionWithDiscriminantFoo value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for bar
    /// </summary>
    [Serializable]
    public struct Bar
    {
        public Bar(SeedApi.UnionWithDiscriminantBar value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithDiscriminantBar Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithDiscriminant.Bar(
            SeedApi.UnionWithDiscriminantBar value
        ) => new(value);
    }
}
