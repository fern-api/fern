// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedExamples.Core;

namespace SeedExamples.Commons;

[JsonConverter(typeof(Data.JsonConverter))]
[Serializable]
public record Data
{
    internal Data(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of Data with <see cref="Data.String"/>.
    /// </summary>
    public Data(Data.String value)
    {
        Type = "string";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of Data with <see cref="Data.Base64"/>.
    /// </summary>
    public Data(Data.Base64 value)
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
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public string AsString() =>
        IsString ? (string)Value! : throw new System.Exception("Data.Type is not 'string'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'base64', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'base64'.</exception>
    public string AsBase64() =>
        IsBase64 ? (string)Value! : throw new System.Exception("Data.Type is not 'base64'");

    public T Match<T>(
        Func<string, T> onString,
        Func<string, T> onBase64,
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
        Action<string> onString,
        Action<string> onBase64,
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
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsString(out string? value)
    {
        if (Type == "string")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsBase64(out string? value)
    {
        if (Type == "base64")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator Data(Data.String value) => new(value);

    public static implicit operator Data(Data.Base64 value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Data>
    {
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(Data).IsAssignableFrom(typeToConvert);

        public override Data Read(
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
                "string" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "base64" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                _ => json.Deserialize<object?>(options),
            };
            return new Data(discriminator, value);
        }

        public override void Write(Utf8JsonWriter writer, Data value, JsonSerializerOptions options)
        {
            JsonNode json =
                value.Type switch
                {
                    "string" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "base64" => new JsonObject
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
    /// Discriminated union type for string
    /// </summary>
    [Serializable]
    public record String
    {
        public String(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator Data.String(string value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for base64
    /// </summary>
    [Serializable]
    public record Base64
    {
        public Base64(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator Data.Base64(string value) => new(value);
    }
}
