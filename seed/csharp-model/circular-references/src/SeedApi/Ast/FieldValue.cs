// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(FieldValue.JsonConverter))]
[Serializable]
public record FieldValue
{
    internal FieldValue(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of FieldValue with <see cref="FieldValue.PrimitiveValue"/>.
    /// </summary>
    public FieldValue(FieldValue.PrimitiveValue value)
    {
        Type = "primitive_value";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of FieldValue with <see cref="FieldValue.ObjectValue"/>.
    /// </summary>
    public FieldValue(FieldValue.ObjectValue value)
    {
        Type = "object_value";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of FieldValue with <see cref="FieldValue.ContainerValue"/>.
    /// </summary>
    public FieldValue(FieldValue.ContainerValue value)
    {
        Type = "container_value";
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
    /// Returns true if <see cref="Type"/> is "primitive_value"
    /// </summary>
    public bool IsPrimitiveValue => Type == "primitive_value";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "object_value"
    /// </summary>
    public bool IsObjectValue => Type == "object_value";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "container_value"
    /// </summary>
    public bool IsContainerValue => Type == "container_value";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.PrimitiveValue"/> if <see cref="Type"/> is 'primitive_value', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'primitive_value'.</exception>
    public SeedApi.PrimitiveValue AsPrimitiveValue() =>
        IsPrimitiveValue
            ? (SeedApi.PrimitiveValue)Value!
            : throw new System.Exception("FieldValue.Type is not 'primitive_value'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.ObjectValue"/> if <see cref="Type"/> is 'object_value', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'object_value'.</exception>
    public SeedApi.ObjectValue AsObjectValue() =>
        IsObjectValue
            ? (SeedApi.ObjectValue)Value!
            : throw new System.Exception("FieldValue.Type is not 'object_value'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.ContainerValue"/> if <see cref="Type"/> is 'container_value', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'container_value'.</exception>
    public SeedApi.ContainerValue AsContainerValue() =>
        IsContainerValue
            ? (SeedApi.ContainerValue)Value!
            : throw new System.Exception("FieldValue.Type is not 'container_value'");

    public T Match<T>(
        Func<SeedApi.PrimitiveValue, T> onPrimitiveValue,
        Func<SeedApi.ObjectValue, T> onObjectValue,
        Func<SeedApi.ContainerValue, T> onContainerValue,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "primitive_value" => onPrimitiveValue(AsPrimitiveValue()),
            "object_value" => onObjectValue(AsObjectValue()),
            "container_value" => onContainerValue(AsContainerValue()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.PrimitiveValue> onPrimitiveValue,
        Action<SeedApi.ObjectValue> onObjectValue,
        Action<SeedApi.ContainerValue> onContainerValue,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "primitive_value":
                onPrimitiveValue(AsPrimitiveValue());
                break;
            case "object_value":
                onObjectValue(AsObjectValue());
                break;
            case "container_value":
                onContainerValue(AsContainerValue());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.PrimitiveValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsPrimitiveValue(out SeedApi.PrimitiveValue? value)
    {
        if (Type == "primitive_value")
        {
            value = (SeedApi.PrimitiveValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.ObjectValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsObjectValue(out SeedApi.ObjectValue? value)
    {
        if (Type == "object_value")
        {
            value = (SeedApi.ObjectValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.ContainerValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsContainerValue(out SeedApi.ContainerValue? value)
    {
        if (Type == "container_value")
        {
            value = (SeedApi.ContainerValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator FieldValue(FieldValue.PrimitiveValue value) => new(value);

    public static implicit operator FieldValue(FieldValue.ObjectValue value) => new(value);

    public static implicit operator FieldValue(FieldValue.ContainerValue value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<FieldValue>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(FieldValue).IsAssignableFrom(typeToConvert);

        public override FieldValue Read(
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
                "primitive_value" => json.GetProperty("value")
                    .Deserialize<SeedApi.PrimitiveValue?>(options)
                ?? throw new JsonException("Failed to deserialize SeedApi.PrimitiveValue"),
                "object_value" => json.Deserialize<SeedApi.ObjectValue?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.ObjectValue"),
                "container_value" => json.GetProperty("value")
                    .Deserialize<SeedApi.ContainerValue?>(options)
                ?? throw new JsonException("Failed to deserialize SeedApi.ContainerValue"),
                _ => json.Deserialize<object?>(options),
            };
            return new FieldValue(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            FieldValue value,
            JsonSerializerOptions options
        )
        {
            JsonObject json =
                value.Type switch
                {
                    "primitive_value" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "object_value" => JsonSerializer.SerializeToNode(value.Value, options)
                        as JsonObject,
                    "container_value" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    _ => JsonSerializer.SerializeToNode(value.Value, options) as JsonObject,
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for primitive_value
    /// </summary>
    [Serializable]
    public struct PrimitiveValue
    {
        public PrimitiveValue(SeedApi.PrimitiveValue value)
        {
            Value = value;
        }

        internal SeedApi.PrimitiveValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator FieldValue.PrimitiveValue(SeedApi.PrimitiveValue value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for object_value
    /// </summary>
    [Serializable]
    public struct ObjectValue
    {
        public ObjectValue(SeedApi.ObjectValue value)
        {
            Value = value;
        }

        internal SeedApi.ObjectValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator FieldValue.ObjectValue(SeedApi.ObjectValue value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for container_value
    /// </summary>
    [Serializable]
    public struct ContainerValue
    {
        public ContainerValue(SeedApi.ContainerValue value)
        {
            Value = value;
        }

        internal SeedApi.ContainerValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator FieldValue.ContainerValue(SeedApi.ContainerValue value) =>
            new(value);
    }
}
