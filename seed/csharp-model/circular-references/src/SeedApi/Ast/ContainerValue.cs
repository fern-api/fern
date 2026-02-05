// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(ContainerValue.JsonConverter))]
[Serializable]
public record ContainerValue
{
    internal ContainerValue(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of ContainerValue with <see cref="ContainerValue.List"/>.
    /// </summary>
    public ContainerValue(ContainerValue.List value)
    {
        Type = "list";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of ContainerValue with <see cref="ContainerValue.Optional"/>.
    /// </summary>
    public ContainerValue(ContainerValue.Optional value)
    {
        Type = "optional";
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
    /// Returns true if <see cref="Type"/> is "list"
    /// </summary>
    public bool IsList => Type == "list";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "optional"
    /// </summary>
    public bool IsOptional => Type == "optional";

    /// <summary>
    /// Returns the value as a <see cref="IEnumerable<FieldValue>"/> if <see cref="Type"/> is 'list', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'list'.</exception>
    public IEnumerable<FieldValue> AsList() =>
        IsList
            ? (IEnumerable<FieldValue>)Value!
            : throw new System.Exception("ContainerValue.Type is not 'list'");

    /// <summary>
    /// Returns the value as a <see cref="FieldValue?"/> if <see cref="Type"/> is 'optional', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'optional'.</exception>
    public FieldValue? AsOptional() =>
        IsOptional
            ? (FieldValue?)Value!
            : throw new System.Exception("ContainerValue.Type is not 'optional'");

    public T Match<T>(
        Func<IEnumerable<FieldValue>, T> onList,
        Func<FieldValue?, T> onOptional,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "list" => onList(AsList()),
            "optional" => onOptional(AsOptional()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<IEnumerable<FieldValue>> onList,
        Action<FieldValue?> onOptional,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "list":
                onList(AsList());
                break;
            case "optional":
                onOptional(AsOptional());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="IEnumerable<FieldValue>"/> and returns true if successful.
    /// </summary>
    public bool TryAsList(out IEnumerable<FieldValue>? value)
    {
        if (Type == "list")
        {
            value = (IEnumerable<FieldValue>)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="FieldValue?"/> and returns true if successful.
    /// </summary>
    public bool TryAsOptional(out FieldValue? value)
    {
        if (Type == "optional")
        {
            value = (FieldValue?)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator ContainerValue(ContainerValue.List value) => new(value);

    public static implicit operator ContainerValue(ContainerValue.Optional value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<ContainerValue>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(ContainerValue).IsAssignableFrom(typeToConvert);

        public override ContainerValue Read(
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
                "list" => json.GetProperty("value").Deserialize<IEnumerable<FieldValue>?>(options)
                ?? throw new JsonException("Failed to deserialize IEnumerable<FieldValue>"),
                "optional" => json.GetProperty("value").Deserialize<FieldValue?>(options),
                _ => json.Deserialize<object?>(options),
            };
            return new ContainerValue(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            ContainerValue value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "list" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "optional" => new JsonObject
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
    /// Discriminated union type for list
    /// </summary>
    [Serializable]
    public record List
    {
        public List(IEnumerable<FieldValue> value)
        {
            Value = value;
        }

        internal IEnumerable<FieldValue> Value { get; set; } = new List<FieldValue>();

        public override string ToString() => Value.ToString() ?? "null";
    }

    /// <summary>
    /// Discriminated union type for optional
    /// </summary>
    [Serializable]
    public record Optional
    {
        public Optional(FieldValue? value)
        {
            Value = value;
        }

        internal FieldValue? Value { get; set; }

        public override string ToString() => Value?.ToString() ?? "null";

        public static implicit operator ContainerValue.Optional(FieldValue? value) => new(value);
    }
}
