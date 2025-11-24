// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

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
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'positiveInt', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'positiveInt'.</exception>
    public int AsPositiveInt() =>
        IsPositiveInt
            ? (int)Value!
            : throw new System.Exception("UnionWithSameNumberTypes.Type is not 'positiveInt'");

    /// <summary>
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'negativeInt', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'negativeInt'.</exception>
    public int AsNegativeInt() =>
        IsNegativeInt
            ? (int)Value!
            : throw new System.Exception("UnionWithSameNumberTypes.Type is not 'negativeInt'");

    /// <summary>
    /// Returns the value as a <see cref="double"/> if <see cref="Type"/> is 'anyNumber', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'anyNumber'.</exception>
    public double AsAnyNumber() =>
        IsAnyNumber
            ? (double)Value!
            : throw new System.Exception("UnionWithSameNumberTypes.Type is not 'anyNumber'");

    public T Match<T>(
        Func<int, T> onPositiveInt,
        Func<int, T> onNegativeInt,
        Func<double, T> onAnyNumber,
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
        Action<int> onPositiveInt,
        Action<int> onNegativeInt,
        Action<double> onAnyNumber,
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
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryAsPositiveInt(out int? value)
    {
        if (Type == "positiveInt")
        {
            value = (int)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryAsNegativeInt(out int? value)
    {
        if (Type == "negativeInt")
        {
            value = (int)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="double"/> and returns true if successful.
    /// </summary>
    public bool TryAsAnyNumber(out double? value)
    {
        if (Type == "anyNumber")
        {
            value = (double)Value!;
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
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(UnionWithSameNumberTypes).IsAssignableFrom(typeToConvert);

        public override UnionWithSameNumberTypes Read(
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
                "positiveInt" => json.GetProperty("value").Deserialize<int>(options),
                "negativeInt" => json.GetProperty("value").Deserialize<int>(options),
                "anyNumber" => json.GetProperty("value").Deserialize<double>(options),
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
                    "positiveInt" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "negativeInt" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "anyNumber" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for positiveInt
    /// </summary>
    [Serializable]
    public struct PositiveInt
    {
        public PositiveInt(int value)
        {
            Value = value;
        }

        internal int Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithSameNumberTypes.PositiveInt(int value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for negativeInt
    /// </summary>
    [Serializable]
    public struct NegativeInt
    {
        public NegativeInt(int value)
        {
            Value = value;
        }

        internal int Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithSameNumberTypes.NegativeInt(int value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for anyNumber
    /// </summary>
    [Serializable]
    public struct AnyNumber
    {
        public AnyNumber(double value)
        {
            Value = value;
        }

        internal double Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithSameNumberTypes.AnyNumber(double value) =>
            new(value);
    }
}
