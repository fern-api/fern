// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedObject.Core;

namespace SeedObject;

/// <summary>
/// lorem ipsum
/// </summary>
[JsonConverter(typeof(DiscriminatedUnion1.JsonConverter))]
[Serializable]
public record DiscriminatedUnion1
{
    internal DiscriminatedUnion1(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of DiscriminatedUnion1 with <see cref="DiscriminatedUnion1.Type1"/>.
    /// </summary>
    public DiscriminatedUnion1(DiscriminatedUnion1.Type1 value)
    {
        Type = "type1";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DiscriminatedUnion1 with <see cref="DiscriminatedUnion1.Type2"/>.
    /// </summary>
    public DiscriminatedUnion1(DiscriminatedUnion1.Type2 value)
    {
        Type = "type2";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of DiscriminatedUnion1 with <see cref="DiscriminatedUnion1.Ref"/>.
    /// </summary>
    public DiscriminatedUnion1(DiscriminatedUnion1.Ref value)
    {
        Type = "ref";
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
    /// Returns true if <see cref="Type"/> is "type1"
    /// </summary>
    public bool IsType1 => Type == "type1";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "type2"
    /// </summary>
    public bool IsType2 => Type == "type2";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "ref"
    /// </summary>
    public bool IsRef => Type == "ref";

    /// <summary>
    /// Returns the value as a <see cref="SeedObject.DiscriminatedUnion1InlineType1"/> if <see cref="Type"/> is 'type1', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'type1'.</exception>
    public SeedObject.DiscriminatedUnion1InlineType1 AsType1() =>
        IsType1
            ? (SeedObject.DiscriminatedUnion1InlineType1)Value!
            : throw new System.Exception("DiscriminatedUnion1.Type is not 'type1'");

    /// <summary>
    /// Returns the value as a <see cref="SeedObject.DiscriminatedUnion1InlineType2"/> if <see cref="Type"/> is 'type2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'type2'.</exception>
    public SeedObject.DiscriminatedUnion1InlineType2 AsType2() =>
        IsType2
            ? (SeedObject.DiscriminatedUnion1InlineType2)Value!
            : throw new System.Exception("DiscriminatedUnion1.Type is not 'type2'");

    /// <summary>
    /// Returns the value as a <see cref="SeedObject.ReferenceType"/> if <see cref="Type"/> is 'ref', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'ref'.</exception>
    public SeedObject.ReferenceType AsRef() =>
        IsRef
            ? (SeedObject.ReferenceType)Value!
            : throw new System.Exception("DiscriminatedUnion1.Type is not 'ref'");

    public T Match<T>(
        Func<SeedObject.DiscriminatedUnion1InlineType1, T> onType1,
        Func<SeedObject.DiscriminatedUnion1InlineType2, T> onType2,
        Func<SeedObject.ReferenceType, T> onRef,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "type1" => onType1(AsType1()),
            "type2" => onType2(AsType2()),
            "ref" => onRef(AsRef()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedObject.DiscriminatedUnion1InlineType1> onType1,
        Action<SeedObject.DiscriminatedUnion1InlineType2> onType2,
        Action<SeedObject.ReferenceType> onRef,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "type1":
                onType1(AsType1());
                break;
            case "type2":
                onType2(AsType2());
                break;
            case "ref":
                onRef(AsRef());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedObject.DiscriminatedUnion1InlineType1"/> and returns true if successful.
    /// </summary>
    public bool TryAsType1(out SeedObject.DiscriminatedUnion1InlineType1? value)
    {
        if (Type == "type1")
        {
            value = (SeedObject.DiscriminatedUnion1InlineType1)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedObject.DiscriminatedUnion1InlineType2"/> and returns true if successful.
    /// </summary>
    public bool TryAsType2(out SeedObject.DiscriminatedUnion1InlineType2? value)
    {
        if (Type == "type2")
        {
            value = (SeedObject.DiscriminatedUnion1InlineType2)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedObject.ReferenceType"/> and returns true if successful.
    /// </summary>
    public bool TryAsRef(out SeedObject.ReferenceType? value)
    {
        if (Type == "ref")
        {
            value = (SeedObject.ReferenceType)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator DiscriminatedUnion1(DiscriminatedUnion1.Type1 value) =>
        new(value);

    public static implicit operator DiscriminatedUnion1(DiscriminatedUnion1.Type2 value) =>
        new(value);

    public static implicit operator DiscriminatedUnion1(DiscriminatedUnion1.Ref value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<DiscriminatedUnion1>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(DiscriminatedUnion1).IsAssignableFrom(typeToConvert);

        public override DiscriminatedUnion1 Read(
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

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("type");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "type1" =>
                    jsonWithoutDiscriminator.Deserialize<SeedObject.DiscriminatedUnion1InlineType1?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedObject.DiscriminatedUnion1InlineType1"
                        ),
                "type2" =>
                    jsonWithoutDiscriminator.Deserialize<SeedObject.DiscriminatedUnion1InlineType2?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedObject.DiscriminatedUnion1InlineType2"
                        ),
                "ref" => jsonWithoutDiscriminator.Deserialize<SeedObject.ReferenceType?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedObject.ReferenceType"),
                _ => json.Deserialize<object?>(options),
            };
            return new DiscriminatedUnion1(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            DiscriminatedUnion1 value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "type1" => JsonSerializer.SerializeToNode(value.Value, options),
                    "type2" => JsonSerializer.SerializeToNode(value.Value, options),
                    "ref" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for type1
    /// </summary>
    [Serializable]
    public struct Type1
    {
        public Type1(SeedObject.DiscriminatedUnion1InlineType1 value)
        {
            Value = value;
        }

        internal SeedObject.DiscriminatedUnion1InlineType1 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DiscriminatedUnion1.Type1(
            SeedObject.DiscriminatedUnion1InlineType1 value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for type2
    /// </summary>
    [Serializable]
    public struct Type2
    {
        public Type2(SeedObject.DiscriminatedUnion1InlineType2 value)
        {
            Value = value;
        }

        internal SeedObject.DiscriminatedUnion1InlineType2 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DiscriminatedUnion1.Type2(
            SeedObject.DiscriminatedUnion1InlineType2 value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for ref
    /// </summary>
    [Serializable]
    public struct Ref
    {
        public Ref(SeedObject.ReferenceType value)
        {
            Value = value;
        }

        internal SeedObject.ReferenceType Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator DiscriminatedUnion1.Ref(SeedObject.ReferenceType value) =>
            new(value);
    }
}
