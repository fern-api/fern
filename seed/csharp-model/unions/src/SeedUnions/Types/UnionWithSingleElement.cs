// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithSingleElement.JsonConverter))]
[Serializable]
public record UnionWithSingleElement
{
    internal UnionWithSingleElement(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithSingleElement with <see cref="UnionWithSingleElement.Foo"/>.
    /// </summary>
    public UnionWithSingleElement(UnionWithSingleElement.Foo value)
    {
        Type = "foo";
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
    /// Returns the value as a <see cref="SeedUnions.Foo"/> if <see cref="Type"/> is 'foo', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo'.</exception>
    public SeedUnions.Foo AsFoo() =>
        IsFoo
            ? (SeedUnions.Foo)Value!
            : throw new System.Exception("UnionWithSingleElement.Type is not 'foo'");

    public T Match<T>(Func<SeedUnions.Foo, T> onFoo, Func<string, object?, T> onUnknown_)
    {
        return Type switch
        {
            "foo" => onFoo(AsFoo()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(Action<SeedUnions.Foo> onFoo, Action<string, object?> onUnknown_)
    {
        switch (Type)
        {
            case "foo":
                onFoo(AsFoo());
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

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithSingleElement(UnionWithSingleElement.Foo value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithSingleElement>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithSingleElement).IsAssignableFrom(typeToConvert);

        public override UnionWithSingleElement Read(
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
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithSingleElement(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithSingleElement value,
            JsonSerializerOptions options
        )
        {
            JsonObject json =
                value.Type switch
                {
                    "foo" => JsonSerializer.SerializeToNode(value.Value, options) as JsonObject,
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

        public static implicit operator UnionWithSingleElement.Foo(SeedUnions.Foo value) =>
            new(value);
    }
}
