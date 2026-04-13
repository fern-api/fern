// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
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
    /// Returns the value as a <see cref="SeedApi.ContainerValueList"/> if <see cref="Type"/> is 'list', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'list'.</exception>
    public SeedApi.ContainerValueList AsList() =>
        IsList
            ? (SeedApi.ContainerValueList)Value!
            : throw new global::System.Exception("ContainerValue.Type is not 'list'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.ContainerValueOptional"/> if <see cref="Type"/> is 'optional', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'optional'.</exception>
    public SeedApi.ContainerValueOptional AsOptional() =>
        IsOptional
            ? (SeedApi.ContainerValueOptional)Value!
            : throw new global::System.Exception("ContainerValue.Type is not 'optional'");

    public T Match<T>(
        Func<SeedApi.ContainerValueList, T> onList,
        Func<SeedApi.ContainerValueOptional, T> onOptional,
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
        Action<SeedApi.ContainerValueList> onList,
        Action<SeedApi.ContainerValueOptional> onOptional,
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
    /// Attempts to cast the value to a <see cref="SeedApi.ContainerValueList"/> and returns true if successful.
    /// </summary>
    public bool TryAsList(out SeedApi.ContainerValueList? value)
    {
        if (Type == "list")
        {
            value = (SeedApi.ContainerValueList)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.ContainerValueOptional"/> and returns true if successful.
    /// </summary>
    public bool TryAsOptional(out SeedApi.ContainerValueOptional? value)
    {
        if (Type == "optional")
        {
            value = (SeedApi.ContainerValueOptional)Value!;
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
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(ContainerValue).IsAssignableFrom(typeToConvert);

        public override ContainerValue Read(
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
                "list" => jsonWithoutDiscriminator.Deserialize<SeedApi.ContainerValueList?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.ContainerValueList"),
                "optional" => jsonWithoutDiscriminator.Deserialize<SeedApi.ContainerValueOptional?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedApi.ContainerValueOptional"
                    ),
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
                    "list" => JsonSerializer.SerializeToNode(value.Value, options),
                    "optional" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override ContainerValue ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new ContainerValue(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            ContainerValue value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for list
    /// </summary>
    [Serializable]
    public struct List
    {
        public List(SeedApi.ContainerValueList value)
        {
            Value = value;
        }

        internal SeedApi.ContainerValueList Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ContainerValue.List(SeedApi.ContainerValueList value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for optional
    /// </summary>
    [Serializable]
    public struct Optional
    {
        public Optional(SeedApi.ContainerValueOptional value)
        {
            Value = value;
        }

        internal SeedApi.ContainerValueOptional Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator ContainerValue.Optional(
            SeedApi.ContainerValueOptional value
        ) => new(value);
    }
}
