// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithGlobalNameCollisions.JsonConverter))]
[Serializable]
public record UnionWithGlobalNameCollisions
{
    internal UnionWithGlobalNameCollisions(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithGlobalNameCollisions with <see cref="UnionWithGlobalNameCollisions.Date"/>.
    /// </summary>
    public UnionWithGlobalNameCollisions(UnionWithGlobalNameCollisions.Date value)
    {
        Type = "Date";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithGlobalNameCollisions with <see cref="UnionWithGlobalNameCollisions.Error"/>.
    /// </summary>
    public UnionWithGlobalNameCollisions(UnionWithGlobalNameCollisions.Error value)
    {
        Type = "Error";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithGlobalNameCollisions with <see cref="UnionWithGlobalNameCollisions.Aim"/>.
    /// </summary>
    public UnionWithGlobalNameCollisions(UnionWithGlobalNameCollisions.Aim value)
    {
        Type = "Aim";
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
    /// Returns true if <see cref="Type"/> is "Date"
    /// </summary>
    public bool IsDate => Type == "Date";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "Error"
    /// </summary>
    public bool IsError => Type == "Error";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "Aim"
    /// </summary>
    public bool IsAim => Type == "Aim";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'Date', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'Date'.</exception>
    public string AsDate() =>
        IsDate
            ? (string)Value!
            : throw new global::System.Exception(
                "UnionWithGlobalNameCollisions.Type is not 'Date'"
            );

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'Error', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'Error'.</exception>
    public string AsError() =>
        IsError
            ? (string)Value!
            : throw new global::System.Exception(
                "UnionWithGlobalNameCollisions.Type is not 'Error'"
            );

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'Aim', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'Aim'.</exception>
    public string AsAim() =>
        IsAim
            ? (string)Value!
            : throw new global::System.Exception("UnionWithGlobalNameCollisions.Type is not 'Aim'");

    public T Match<T>(
        Func<string, T> onDate,
        Func<string, T> onError,
        Func<string, T> onAim,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "Date" => onDate(AsDate()),
            "Error" => onError(AsError()),
            "Aim" => onAim(AsAim()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<string> onDate,
        Action<string> onError,
        Action<string> onAim,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "Date":
                onDate(AsDate());
                break;
            case "Error":
                onError(AsError());
                break;
            case "Aim":
                onAim(AsAim());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsDate(out string? value)
    {
        if (Type == "Date")
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
    public bool TryAsError(out string? value)
    {
        if (Type == "Error")
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
    public bool TryAsAim(out string? value)
    {
        if (Type == "Aim")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithGlobalNameCollisions(
        UnionWithGlobalNameCollisions.Date value
    ) => new(value);

    public static implicit operator UnionWithGlobalNameCollisions(
        UnionWithGlobalNameCollisions.Error value
    ) => new(value);

    public static implicit operator UnionWithGlobalNameCollisions(
        UnionWithGlobalNameCollisions.Aim value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithGlobalNameCollisions>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithGlobalNameCollisions).IsAssignableFrom(typeToConvert);

        public override UnionWithGlobalNameCollisions Read(
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
                "Date" => json.GetProperty("value").Deserialize<string?>(options)
                    ?? throw new JsonException("Failed to deserialize string"),
                "Error" => json.GetProperty("value").Deserialize<string?>(options)
                    ?? throw new JsonException("Failed to deserialize string"),
                "Aim" => json.GetProperty("value").Deserialize<string?>(options)
                    ?? throw new JsonException("Failed to deserialize string"),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithGlobalNameCollisions(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithGlobalNameCollisions value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "Date" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "Error" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "Aim" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override UnionWithGlobalNameCollisions ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new UnionWithGlobalNameCollisions(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithGlobalNameCollisions value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for Date
    /// </summary>
    [Serializable]
    public record Date
    {
        public Date(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator UnionWithGlobalNameCollisions.Date(string value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for Error
    /// </summary>
    [Serializable]
    public record Error
    {
        public Error(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator UnionWithGlobalNameCollisions.Error(string value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for Aim
    /// </summary>
    [Serializable]
    public record Aim
    {
        public Aim(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator UnionWithGlobalNameCollisions.Aim(string value) =>
            new(value);
    }
}
