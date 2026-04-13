// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithSameNumberTypes.JsonConverter))]
[Serializable]
public record UnionWithSameNumberTypes
{
    internal UnionWithSameNumberTypes(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithSameNumberTypes with <see cref="UnionWithSameNumberTypes.PositiveInt"/>.
    /// </summary>
    public UnionWithSameNumberTypes(UnionWithSameNumberTypes.PositiveInt value)
    {
        Type = "positiveInt";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithSameNumberTypes with <see cref="UnionWithSameNumberTypes.NegativeInt"/>.
    /// </summary>
    public UnionWithSameNumberTypes(UnionWithSameNumberTypes.NegativeInt value)
    {
        Type = "negativeInt";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithSameNumberTypes with <see cref="UnionWithSameNumberTypes.AnyNumber"/>.
    /// </summary>
    public UnionWithSameNumberTypes(UnionWithSameNumberTypes.AnyNumber value)
    {
        Type = "anyNumber";
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
    /// Returns true if <see cref="Type"/> is "positiveInt"
    /// </summary>
    public bool IsPositiveInt => Type == "positiveInt";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "negativeInt"
    /// </summary>
    public bool IsNegativeInt => Type == "negativeInt";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "anyNumber"
    /// </summary>
    public bool IsAnyNumber => Type == "anyNumber";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithSameNumberTypesPositiveInt"/> if <see cref="Type"/> is 'positiveInt', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'positiveInt'.</exception>
    public SeedApi.UnionWithSameNumberTypesPositiveInt AsPositiveInt() =>
        IsPositiveInt
            ? (SeedApi.UnionWithSameNumberTypesPositiveInt)Value!
            : throw new global::System.Exception(
                "UnionWithSameNumberTypes.Type is not 'positiveInt'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithSameNumberTypesNegativeInt"/> if <see cref="Type"/> is 'negativeInt', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'negativeInt'.</exception>
    public SeedApi.UnionWithSameNumberTypesNegativeInt AsNegativeInt() =>
        IsNegativeInt
            ? (SeedApi.UnionWithSameNumberTypesNegativeInt)Value!
            : throw new global::System.Exception(
                "UnionWithSameNumberTypes.Type is not 'negativeInt'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithSameNumberTypesAnyNumber"/> if <see cref="Type"/> is 'anyNumber', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'anyNumber'.</exception>
    public SeedApi.UnionWithSameNumberTypesAnyNumber AsAnyNumber() =>
        IsAnyNumber
            ? (SeedApi.UnionWithSameNumberTypesAnyNumber)Value!
            : throw new global::System.Exception(
                "UnionWithSameNumberTypes.Type is not 'anyNumber'"
            );

    public T Match<T>(
        Func<SeedApi.UnionWithSameNumberTypesPositiveInt, T> onPositiveInt,
        Func<SeedApi.UnionWithSameNumberTypesNegativeInt, T> onNegativeInt,
        Func<SeedApi.UnionWithSameNumberTypesAnyNumber, T> onAnyNumber,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "positiveInt" => onPositiveInt(AsPositiveInt()),
            "negativeInt" => onNegativeInt(AsNegativeInt()),
            "anyNumber" => onAnyNumber(AsAnyNumber()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.UnionWithSameNumberTypesPositiveInt> onPositiveInt,
        Action<SeedApi.UnionWithSameNumberTypesNegativeInt> onNegativeInt,
        Action<SeedApi.UnionWithSameNumberTypesAnyNumber> onAnyNumber,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "positiveInt":
                onPositiveInt(AsPositiveInt());
                break;
            case "negativeInt":
                onNegativeInt(AsNegativeInt());
                break;
            case "anyNumber":
                onAnyNumber(AsAnyNumber());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithSameNumberTypesPositiveInt"/> and returns true if successful.
    /// </summary>
    public bool TryAsPositiveInt(out SeedApi.UnionWithSameNumberTypesPositiveInt? value)
    {
        if (Type == "positiveInt")
        {
            value = (SeedApi.UnionWithSameNumberTypesPositiveInt)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithSameNumberTypesNegativeInt"/> and returns true if successful.
    /// </summary>
    public bool TryAsNegativeInt(out SeedApi.UnionWithSameNumberTypesNegativeInt? value)
    {
        if (Type == "negativeInt")
        {
            value = (SeedApi.UnionWithSameNumberTypesNegativeInt)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithSameNumberTypesAnyNumber"/> and returns true if successful.
    /// </summary>
    public bool TryAsAnyNumber(out SeedApi.UnionWithSameNumberTypesAnyNumber? value)
    {
        if (Type == "anyNumber")
        {
            value = (SeedApi.UnionWithSameNumberTypesAnyNumber)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithSameNumberTypes(
        UnionWithSameNumberTypes.PositiveInt value
    ) => new(value);

    public static implicit operator UnionWithSameNumberTypes(
        UnionWithSameNumberTypes.NegativeInt value
    ) => new(value);

    public static implicit operator UnionWithSameNumberTypes(
        UnionWithSameNumberTypes.AnyNumber value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithSameNumberTypes>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithSameNumberTypes).IsAssignableFrom(typeToConvert);

        public override UnionWithSameNumberTypes Read(
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
                "positiveInt" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithSameNumberTypesPositiveInt?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithSameNumberTypesPositiveInt"
                        ),
                "negativeInt" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithSameNumberTypesNegativeInt?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithSameNumberTypesNegativeInt"
                        ),
                "anyNumber" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithSameNumberTypesAnyNumber?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithSameNumberTypesAnyNumber"
                        ),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithSameNumberTypes(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithSameNumberTypes value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "positiveInt" => JsonSerializer.SerializeToNode(value.Value, options),
                    "negativeInt" => JsonSerializer.SerializeToNode(value.Value, options),
                    "anyNumber" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override UnionWithSameNumberTypes ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new UnionWithSameNumberTypes(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithSameNumberTypes value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for positiveInt
    /// </summary>
    [Serializable]
    public struct PositiveInt
    {
        public PositiveInt(SeedApi.UnionWithSameNumberTypesPositiveInt value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithSameNumberTypesPositiveInt Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithSameNumberTypes.PositiveInt(
            SeedApi.UnionWithSameNumberTypesPositiveInt value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for negativeInt
    /// </summary>
    [Serializable]
    public struct NegativeInt
    {
        public NegativeInt(SeedApi.UnionWithSameNumberTypesNegativeInt value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithSameNumberTypesNegativeInt Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithSameNumberTypes.NegativeInt(
            SeedApi.UnionWithSameNumberTypesNegativeInt value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for anyNumber
    /// </summary>
    [Serializable]
    public struct AnyNumber
    {
        public AnyNumber(SeedApi.UnionWithSameNumberTypesAnyNumber value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithSameNumberTypesAnyNumber Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithSameNumberTypes.AnyNumber(
            SeedApi.UnionWithSameNumberTypesAnyNumber value
        ) => new(value);
    }
}
