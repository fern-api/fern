// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedNurseryApi.Core;

namespace SeedNurseryApi;

[JsonConverter(typeof(SipHeaderAction.JsonConverter))]
[Serializable]
public record SipHeaderAction
{
    internal SipHeaderAction(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of SipHeaderAction with <see cref="SipHeaderAction.Static"/>.
    /// </summary>
    public SipHeaderAction(SipHeaderAction.Static value)
    {
        Type = "static";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of SipHeaderAction with <see cref="SipHeaderAction.Dynamic"/>.
    /// </summary>
    public SipHeaderAction(SipHeaderAction.Dynamic value)
    {
        Type = "dynamic";
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
    /// Returns true if <see cref="Type"/> is "static"
    /// </summary>
    public bool IsStatic => Type == "static";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "dynamic"
    /// </summary>
    public bool IsDynamic => Type == "dynamic";

    /// <summary>
    /// Returns the value as a <see cref="SeedNurseryApi.CustomSipHeader"/> if <see cref="Type"/> is 'static', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'static'.</exception>
    public SeedNurseryApi.CustomSipHeader AsStatic() =>
        IsStatic
            ? (SeedNurseryApi.CustomSipHeader)Value!
            : throw new global::System.Exception("SipHeaderAction.Type is not 'static'");

    /// <summary>
    /// Returns the value as a <see cref="SeedNurseryApi.CustomSipHeader"/> if <see cref="Type"/> is 'dynamic', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'dynamic'.</exception>
    public SeedNurseryApi.CustomSipHeader AsDynamic() =>
        IsDynamic
            ? (SeedNurseryApi.CustomSipHeader)Value!
            : throw new global::System.Exception("SipHeaderAction.Type is not 'dynamic'");

    public T Match<T>(
        Func<SeedNurseryApi.CustomSipHeader, T> onStatic,
        Func<SeedNurseryApi.CustomSipHeader, T> onDynamic,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "static" => onStatic(AsStatic()),
            "dynamic" => onDynamic(AsDynamic()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedNurseryApi.CustomSipHeader> onStatic,
        Action<SeedNurseryApi.CustomSipHeader> onDynamic,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "static":
                onStatic(AsStatic());
                break;
            case "dynamic":
                onDynamic(AsDynamic());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNurseryApi.CustomSipHeader"/> and returns true if successful.
    /// </summary>
    public bool TryAsStatic(out SeedNurseryApi.CustomSipHeader? value)
    {
        if (Type == "static")
        {
            value = (SeedNurseryApi.CustomSipHeader)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedNurseryApi.CustomSipHeader"/> and returns true if successful.
    /// </summary>
    public bool TryAsDynamic(out SeedNurseryApi.CustomSipHeader? value)
    {
        if (Type == "dynamic")
        {
            value = (SeedNurseryApi.CustomSipHeader)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator SipHeaderAction(SipHeaderAction.Static value) => new(value);

    public static implicit operator SipHeaderAction(SipHeaderAction.Dynamic value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<SipHeaderAction>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(SipHeaderAction).IsAssignableFrom(typeToConvert);

        public override SipHeaderAction Read(
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
                "static" => jsonWithoutDiscriminator.Deserialize<SeedNurseryApi.CustomSipHeader?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedNurseryApi.CustomSipHeader"
                    ),
                "dynamic" => jsonWithoutDiscriminator.Deserialize<SeedNurseryApi.CustomSipHeader?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedNurseryApi.CustomSipHeader"
                    ),
                _ => json.Deserialize<object?>(options),
            };
            return new SipHeaderAction(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            SipHeaderAction value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "static" => JsonSerializer.SerializeToNode(value.Value, options),
                    "dynamic" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override SipHeaderAction ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new SipHeaderAction(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            SipHeaderAction value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for static
    /// </summary>
    [Serializable]
    public struct Static
    {
        public Static(SeedNurseryApi.CustomSipHeader value)
        {
            Value = value;
        }

        internal SeedNurseryApi.CustomSipHeader Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SipHeaderAction.Static(
            SeedNurseryApi.CustomSipHeader value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for dynamic
    /// </summary>
    [Serializable]
    public struct Dynamic
    {
        public Dynamic(SeedNurseryApi.CustomSipHeader value)
        {
            Value = value;
        }

        internal SeedNurseryApi.CustomSipHeader Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator SipHeaderAction.Dynamic(
            SeedNurseryApi.CustomSipHeader value
        ) => new(value);
    }
}
