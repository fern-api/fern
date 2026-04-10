// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithPrimitive.JsonConverter))]
[Serializable]
public record UnionWithPrimitive
{
    internal UnionWithPrimitive(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithPrimitive with <see cref="UnionWithPrimitive.Integer"/>.
    /// </summary>
    public UnionWithPrimitive(UnionWithPrimitive.Integer value)
    {
        Type = "integer";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithPrimitive with <see cref="UnionWithPrimitive.String"/>.
    /// </summary>
    public UnionWithPrimitive(UnionWithPrimitive.String value)
    {
        Type = "string";
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
    /// Returns true if <see cref="Type"/> is "integer"
    /// </summary>
    public bool IsInteger => Type == "integer";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString => Type == "string";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithPrimitiveInteger"/> if <see cref="Type"/> is 'integer', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'integer'.</exception>
    public SeedApi.UnionWithPrimitiveInteger AsInteger() =>
        IsInteger
            ? (SeedApi.UnionWithPrimitiveInteger)Value!
            : throw new global::System.Exception("UnionWithPrimitive.Type is not 'integer'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithPrimitiveString"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public SeedApi.UnionWithPrimitiveString AsString() =>
        IsString
            ? (SeedApi.UnionWithPrimitiveString)Value!
            : throw new global::System.Exception("UnionWithPrimitive.Type is not 'string'");

    public T Match<T>(
        Func<SeedApi.UnionWithPrimitiveInteger, T> onInteger,
        Func<SeedApi.UnionWithPrimitiveString, T> onString,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "integer" => onInteger(AsInteger()),
            "string" => onString(AsString()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.UnionWithPrimitiveInteger> onInteger,
        Action<SeedApi.UnionWithPrimitiveString> onString,
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
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithPrimitiveInteger"/> and returns true if successful.
    /// </summary>
    public bool TryAsInteger(out SeedApi.UnionWithPrimitiveInteger? value)
    {
        if (Type == "integer")
        {
            value = (SeedApi.UnionWithPrimitiveInteger)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithPrimitiveString"/> and returns true if successful.
    /// </summary>
    public bool TryAsString(out SeedApi.UnionWithPrimitiveString? value)
    {
        if (Type == "string")
        {
            value = (SeedApi.UnionWithPrimitiveString)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithPrimitive(UnionWithPrimitive.Integer value) =>
        new(value);

    public static implicit operator UnionWithPrimitive(UnionWithPrimitive.String value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithPrimitive>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithPrimitive).IsAssignableFrom(typeToConvert);

        public override UnionWithPrimitive Read(
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
                "integer" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithPrimitiveInteger?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithPrimitiveInteger"
                        ),
                "string" => jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithPrimitiveString?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedApi.UnionWithPrimitiveString"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithPrimitive(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithPrimitive value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "integer" => JsonSerializer.SerializeToNode(value.Value, options),
                    "string" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override UnionWithPrimitive ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new UnionWithPrimitive(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithPrimitive value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for integer
    /// </summary>
    [Serializable]
    public struct Integer
    {
        public Integer(SeedApi.UnionWithPrimitiveInteger value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithPrimitiveInteger Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithPrimitive.Integer(
            SeedApi.UnionWithPrimitiveInteger value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for string
    /// </summary>
    [Serializable]
    public struct String
    {
        public String(SeedApi.UnionWithPrimitiveString value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithPrimitiveString Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithPrimitive.String(
            SeedApi.UnionWithPrimitiveString value
        ) => new(value);
    }
}
