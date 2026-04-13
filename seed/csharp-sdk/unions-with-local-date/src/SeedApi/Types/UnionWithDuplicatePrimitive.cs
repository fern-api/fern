// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithDuplicatePrimitive.JsonConverter))]
[Serializable]
public record UnionWithDuplicatePrimitive
{
    internal UnionWithDuplicatePrimitive(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicatePrimitive with <see cref="UnionWithDuplicatePrimitive.Integer1"/>.
    /// </summary>
    public UnionWithDuplicatePrimitive(UnionWithDuplicatePrimitive.Integer1 value)
    {
        Type = "integer1";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicatePrimitive with <see cref="UnionWithDuplicatePrimitive.Integer2"/>.
    /// </summary>
    public UnionWithDuplicatePrimitive(UnionWithDuplicatePrimitive.Integer2 value)
    {
        Type = "integer2";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicatePrimitive with <see cref="UnionWithDuplicatePrimitive.String1"/>.
    /// </summary>
    public UnionWithDuplicatePrimitive(UnionWithDuplicatePrimitive.String1 value)
    {
        Type = "string1";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithDuplicatePrimitive with <see cref="UnionWithDuplicatePrimitive.String2"/>.
    /// </summary>
    public UnionWithDuplicatePrimitive(UnionWithDuplicatePrimitive.String2 value)
    {
        Type = "string2";
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
    /// Returns true if <see cref="Type"/> is "integer1"
    /// </summary>
    public bool IsInteger1 => Type == "integer1";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "integer2"
    /// </summary>
    public bool IsInteger2 => Type == "integer2";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string1"
    /// </summary>
    public bool IsString1 => Type == "string1";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string2"
    /// </summary>
    public bool IsString2 => Type == "string2";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithDuplicatePrimitiveInteger1"/> if <see cref="Type"/> is 'integer1', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'integer1'.</exception>
    public SeedApi.UnionWithDuplicatePrimitiveInteger1 AsInteger1() =>
        IsInteger1
            ? (SeedApi.UnionWithDuplicatePrimitiveInteger1)Value!
            : throw new global::System.Exception(
                "UnionWithDuplicatePrimitive.Type is not 'integer1'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithDuplicatePrimitiveInteger2"/> if <see cref="Type"/> is 'integer2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'integer2'.</exception>
    public SeedApi.UnionWithDuplicatePrimitiveInteger2 AsInteger2() =>
        IsInteger2
            ? (SeedApi.UnionWithDuplicatePrimitiveInteger2)Value!
            : throw new global::System.Exception(
                "UnionWithDuplicatePrimitive.Type is not 'integer2'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithDuplicatePrimitiveString1"/> if <see cref="Type"/> is 'string1', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'string1'.</exception>
    public SeedApi.UnionWithDuplicatePrimitiveString1 AsString1() =>
        IsString1
            ? (SeedApi.UnionWithDuplicatePrimitiveString1)Value!
            : throw new global::System.Exception(
                "UnionWithDuplicatePrimitive.Type is not 'string1'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithDuplicatePrimitiveString2"/> if <see cref="Type"/> is 'string2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'string2'.</exception>
    public SeedApi.UnionWithDuplicatePrimitiveString2 AsString2() =>
        IsString2
            ? (SeedApi.UnionWithDuplicatePrimitiveString2)Value!
            : throw new global::System.Exception(
                "UnionWithDuplicatePrimitive.Type is not 'string2'"
            );

    public T Match<T>(
        Func<SeedApi.UnionWithDuplicatePrimitiveInteger1, T> onInteger1,
        Func<SeedApi.UnionWithDuplicatePrimitiveInteger2, T> onInteger2,
        Func<SeedApi.UnionWithDuplicatePrimitiveString1, T> onString1,
        Func<SeedApi.UnionWithDuplicatePrimitiveString2, T> onString2,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "integer1" => onInteger1(AsInteger1()),
            "integer2" => onInteger2(AsInteger2()),
            "string1" => onString1(AsString1()),
            "string2" => onString2(AsString2()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.UnionWithDuplicatePrimitiveInteger1> onInteger1,
        Action<SeedApi.UnionWithDuplicatePrimitiveInteger2> onInteger2,
        Action<SeedApi.UnionWithDuplicatePrimitiveString1> onString1,
        Action<SeedApi.UnionWithDuplicatePrimitiveString2> onString2,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "integer1":
                onInteger1(AsInteger1());
                break;
            case "integer2":
                onInteger2(AsInteger2());
                break;
            case "string1":
                onString1(AsString1());
                break;
            case "string2":
                onString2(AsString2());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithDuplicatePrimitiveInteger1"/> and returns true if successful.
    /// </summary>
    public bool TryAsInteger1(out SeedApi.UnionWithDuplicatePrimitiveInteger1? value)
    {
        if (Type == "integer1")
        {
            value = (SeedApi.UnionWithDuplicatePrimitiveInteger1)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithDuplicatePrimitiveInteger2"/> and returns true if successful.
    /// </summary>
    public bool TryAsInteger2(out SeedApi.UnionWithDuplicatePrimitiveInteger2? value)
    {
        if (Type == "integer2")
        {
            value = (SeedApi.UnionWithDuplicatePrimitiveInteger2)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithDuplicatePrimitiveString1"/> and returns true if successful.
    /// </summary>
    public bool TryAsString1(out SeedApi.UnionWithDuplicatePrimitiveString1? value)
    {
        if (Type == "string1")
        {
            value = (SeedApi.UnionWithDuplicatePrimitiveString1)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithDuplicatePrimitiveString2"/> and returns true if successful.
    /// </summary>
    public bool TryAsString2(out SeedApi.UnionWithDuplicatePrimitiveString2? value)
    {
        if (Type == "string2")
        {
            value = (SeedApi.UnionWithDuplicatePrimitiveString2)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithDuplicatePrimitive(
        UnionWithDuplicatePrimitive.Integer1 value
    ) => new(value);

    public static implicit operator UnionWithDuplicatePrimitive(
        UnionWithDuplicatePrimitive.Integer2 value
    ) => new(value);

    public static implicit operator UnionWithDuplicatePrimitive(
        UnionWithDuplicatePrimitive.String1 value
    ) => new(value);

    public static implicit operator UnionWithDuplicatePrimitive(
        UnionWithDuplicatePrimitive.String2 value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithDuplicatePrimitive>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithDuplicatePrimitive).IsAssignableFrom(typeToConvert);

        public override UnionWithDuplicatePrimitive Read(
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
                "integer1" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithDuplicatePrimitiveInteger1?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithDuplicatePrimitiveInteger1"
                        ),
                "integer2" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithDuplicatePrimitiveInteger2?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithDuplicatePrimitiveInteger2"
                        ),
                "string1" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithDuplicatePrimitiveString1?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithDuplicatePrimitiveString1"
                        ),
                "string2" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithDuplicatePrimitiveString2?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithDuplicatePrimitiveString2"
                        ),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithDuplicatePrimitive(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithDuplicatePrimitive value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "integer1" => JsonSerializer.SerializeToNode(value.Value, options),
                    "integer2" => JsonSerializer.SerializeToNode(value.Value, options),
                    "string1" => JsonSerializer.SerializeToNode(value.Value, options),
                    "string2" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override UnionWithDuplicatePrimitive ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new UnionWithDuplicatePrimitive(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithDuplicatePrimitive value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for integer1
    /// </summary>
    [Serializable]
    public struct Integer1
    {
        public Integer1(SeedApi.UnionWithDuplicatePrimitiveInteger1 value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithDuplicatePrimitiveInteger1 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithDuplicatePrimitive.Integer1(
            SeedApi.UnionWithDuplicatePrimitiveInteger1 value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for integer2
    /// </summary>
    [Serializable]
    public struct Integer2
    {
        public Integer2(SeedApi.UnionWithDuplicatePrimitiveInteger2 value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithDuplicatePrimitiveInteger2 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithDuplicatePrimitive.Integer2(
            SeedApi.UnionWithDuplicatePrimitiveInteger2 value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for string1
    /// </summary>
    [Serializable]
    public struct String1
    {
        public String1(SeedApi.UnionWithDuplicatePrimitiveString1 value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithDuplicatePrimitiveString1 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithDuplicatePrimitive.String1(
            SeedApi.UnionWithDuplicatePrimitiveString1 value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for string2
    /// </summary>
    [Serializable]
    public struct String2
    {
        public String2(SeedApi.UnionWithDuplicatePrimitiveString2 value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithDuplicatePrimitiveString2 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithDuplicatePrimitive.String2(
            SeedApi.UnionWithDuplicatePrimitiveString2 value
        ) => new(value);
    }
}
