// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(CommonsData.JsonConverter))]
[Serializable]
public record CommonsData
{
    internal CommonsData(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of CommonsData with <see cref="CommonsData.String"/>.
    /// </summary>
    public CommonsData(CommonsData.String value)
    {
        Type = "string";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of CommonsData with <see cref="CommonsData.Base64"/>.
    /// </summary>
    public CommonsData(CommonsData.Base64 value)
    {
        Type = "base64";
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
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString => Type == "string";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "base64"
    /// </summary>
    public bool IsBase64 => Type == "base64";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.CommonsDataString"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public SeedApi.CommonsDataString AsString() =>
        IsString
            ? (SeedApi.CommonsDataString)Value!
            : throw new global::System.Exception("CommonsData.Type is not 'string'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.CommonsDataBase64"/> if <see cref="Type"/> is 'base64', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'base64'.</exception>
    public SeedApi.CommonsDataBase64 AsBase64() =>
        IsBase64
            ? (SeedApi.CommonsDataBase64)Value!
            : throw new global::System.Exception("CommonsData.Type is not 'base64'");

    public T Match<T>(
        Func<SeedApi.CommonsDataString, T> onString,
        Func<SeedApi.CommonsDataBase64, T> onBase64,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "string" => onString(AsString()),
            "base64" => onBase64(AsBase64()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.CommonsDataString> onString,
        Action<SeedApi.CommonsDataBase64> onBase64,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "string":
                onString(AsString());
                break;
            case "base64":
                onBase64(AsBase64());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.CommonsDataString"/> and returns true if successful.
    /// </summary>
    public bool TryAsString(out SeedApi.CommonsDataString? value)
    {
        if (Type == "string")
        {
            value = (SeedApi.CommonsDataString)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.CommonsDataBase64"/> and returns true if successful.
    /// </summary>
    public bool TryAsBase64(out SeedApi.CommonsDataBase64? value)
    {
        if (Type == "base64")
        {
            value = (SeedApi.CommonsDataBase64)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator CommonsData(CommonsData.String value) => new(value);

    public static implicit operator CommonsData(CommonsData.Base64 value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<CommonsData>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(CommonsData).IsAssignableFrom(typeToConvert);

        public override CommonsData Read(
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
                "string" => jsonWithoutDiscriminator.Deserialize<SeedApi.CommonsDataString?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.CommonsDataString"),
                "base64" => jsonWithoutDiscriminator.Deserialize<SeedApi.CommonsDataBase64?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.CommonsDataBase64"),
                _ => json.Deserialize<object?>(options),
            };
            return new CommonsData(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            CommonsData value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "string" => JsonSerializer.SerializeToNode(value.Value, options),
                    "base64" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override CommonsData ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new CommonsData(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            CommonsData value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for string
    /// </summary>
    [Serializable]
    public struct String
    {
        public String(SeedApi.CommonsDataString value)
        {
            Value = value;
        }

        internal SeedApi.CommonsDataString Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CommonsData.String(SeedApi.CommonsDataString value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for base64
    /// </summary>
    [Serializable]
    public struct Base64
    {
        public Base64(SeedApi.CommonsDataBase64 value)
        {
            Value = value;
        }

        internal SeedApi.CommonsDataBase64 Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator CommonsData.Base64(SeedApi.CommonsDataBase64 value) =>
            new(value);
    }
}
