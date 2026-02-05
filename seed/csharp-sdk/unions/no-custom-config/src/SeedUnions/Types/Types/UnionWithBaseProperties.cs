// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithBaseProperties.JsonConverter))]
[Serializable]
public record UnionWithBaseProperties
{
    internal UnionWithBaseProperties(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithBaseProperties with <see cref="UnionWithBaseProperties.Integer"/>.
    /// </summary>
    public UnionWithBaseProperties(UnionWithBaseProperties.Integer value)
    {
        Type = "integer";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithBaseProperties with <see cref="UnionWithBaseProperties.String"/>.
    /// </summary>
    public UnionWithBaseProperties(UnionWithBaseProperties.String value)
    {
        Type = "string";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithBaseProperties with <see cref="UnionWithBaseProperties.Foo"/>.
    /// </summary>
    public UnionWithBaseProperties(UnionWithBaseProperties.Foo value)
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

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    /// <summary>
    /// Returns true if <see cref="Type"/> is "integer"
    /// </summary>
    public bool IsInteger => Type == "integer";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString => Type == "string";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "foo"
    /// </summary>
    public bool IsFoo => Type == "foo";

    /// <summary>
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'integer', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'integer'.</exception>
    public int AsInteger() =>
        IsInteger
            ? (int)Value!
            : throw new System.Exception("UnionWithBaseProperties.Type is not 'integer'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public string AsString() =>
        IsString
            ? (string)Value!
            : throw new System.Exception("UnionWithBaseProperties.Type is not 'string'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUnions.Foo"/> if <see cref="Type"/> is 'foo', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'foo'.</exception>
    public SeedUnions.Foo AsFoo() =>
        IsFoo
            ? (SeedUnions.Foo)Value!
            : throw new System.Exception("UnionWithBaseProperties.Type is not 'foo'");

    public T Match<T>(
        Func<int, T> onInteger,
        Func<string, T> onString,
        Func<SeedUnions.Foo, T> onFoo,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "integer" => onInteger(AsInteger()),
            "string" => onString(AsString()),
            "foo" => onFoo(AsFoo()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<int> onInteger,
        Action<string> onString,
        Action<SeedUnions.Foo> onFoo,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "integer":
                onInteger(AsInteger());
                break;
            case "string":
                onString(AsString());
                break;
            case "foo":
                onFoo(AsFoo());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryAsInteger(out int? value)
    {
        if (Type == "integer")
        {
            value = (int)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsString(out string? value)
    {
        if (Type == "string")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
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

    /// <summary>
    /// Base properties for the discriminated union
    /// </summary>
    [Serializable]
    internal record BaseProperties
    {
        [JsonPropertyName("id")]
        public required string Id { get; set; }
    }

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithBaseProperties>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(UnionWithBaseProperties).IsAssignableFrom(typeToConvert);

        public override UnionWithBaseProperties Read(
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
                "integer" => json.GetProperty("value").Deserialize<int>(options),
                "string" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "foo" => json.Deserialize<SeedUnions.Foo?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedUnions.Foo"),
                _ => json.Deserialize<object?>(options),
            };
            var baseProperties =
                json.Deserialize<UnionWithBaseProperties.BaseProperties>(options)
                ?? throw new JsonException(
                    "Failed to deserialize UnionWithBaseProperties.BaseProperties"
                );
            return new UnionWithBaseProperties(discriminator, value) { Id = baseProperties.Id };
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithBaseProperties value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "integer" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "string" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "foo" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            var basePropertiesJson =
                JsonSerializer.SerializeToNode(
                    new UnionWithBaseProperties.BaseProperties { Id = value.Id },
                    options
                )
                ?? throw new JsonException(
                    "Failed to serialize UnionWithBaseProperties.BaseProperties"
                );
            foreach (var property in basePropertiesJson.AsObject())
            {
                json[property.Key] = property.Value;
            }
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for integer
    /// </summary>
    [Serializable]
    public struct Integer
    {
        public Integer(int value)
        {
            Value = value;
        }

        internal int Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithBaseProperties.Integer(int value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for string
    /// </summary>
    [Serializable]
    public record String
    {
        public String(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator UnionWithBaseProperties.String(string value) => new(value);
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

        public static implicit operator UnionWithBaseProperties.Foo(SeedUnions.Foo value) =>
            new(value);
    }
}
