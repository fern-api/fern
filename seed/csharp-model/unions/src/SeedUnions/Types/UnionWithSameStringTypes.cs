// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithSameStringTypes.JsonConverter))]
[Serializable]
public record UnionWithSameStringTypes
{
    internal UnionWithSameStringTypes(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithSameStringTypes with <see cref="UnionWithSameStringTypes.CustomFormat"/>.
    /// </summary>
    public UnionWithSameStringTypes(UnionWithSameStringTypes.CustomFormat value)
    {
        Type = "customFormat";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithSameStringTypes with <see cref="UnionWithSameStringTypes.RegularString"/>.
    /// </summary>
    public UnionWithSameStringTypes(UnionWithSameStringTypes.RegularString value)
    {
        Type = "regularString";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithSameStringTypes with <see cref="UnionWithSameStringTypes.PatternString"/>.
    /// </summary>
    public UnionWithSameStringTypes(UnionWithSameStringTypes.PatternString value)
    {
        Type = "patternString";
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
    /// Returns true if <see cref="Type"/> is "customFormat"
    /// </summary>
    public bool IsCustomFormat => Type == "customFormat";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "regularString"
    /// </summary>
    public bool IsRegularString => Type == "regularString";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "patternString"
    /// </summary>
    public bool IsPatternString => Type == "patternString";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'customFormat', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'customFormat'.</exception>
    public string AsCustomFormat() =>
        IsCustomFormat
            ? (string)Value!
            : throw new System.Exception("UnionWithSameStringTypes.Type is not 'customFormat'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'regularString', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'regularString'.</exception>
    public string AsRegularString() =>
        IsRegularString
            ? (string)Value!
            : throw new System.Exception("UnionWithSameStringTypes.Type is not 'regularString'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'patternString', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'patternString'.</exception>
    public string AsPatternString() =>
        IsPatternString
            ? (string)Value!
            : throw new System.Exception("UnionWithSameStringTypes.Type is not 'patternString'");

    public T Match<T>(
        Func<string, T> onCustomFormat,
        Func<string, T> onRegularString,
        Func<string, T> onPatternString,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "customFormat" => onCustomFormat(AsCustomFormat()),
            "regularString" => onRegularString(AsRegularString()),
            "patternString" => onPatternString(AsPatternString()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<string> onCustomFormat,
        Action<string> onRegularString,
        Action<string> onPatternString,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "customFormat":
                onCustomFormat(AsCustomFormat());
                break;
            case "regularString":
                onRegularString(AsRegularString());
                break;
            case "patternString":
                onPatternString(AsPatternString());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsCustomFormat(out string? value)
    {
        if (Type == "customFormat")
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
    public bool TryAsRegularString(out string? value)
    {
        if (Type == "regularString")
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
    public bool TryAsPatternString(out string? value)
    {
        if (Type == "patternString")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithSameStringTypes(
        UnionWithSameStringTypes.CustomFormat value
    ) => new(value);

    public static implicit operator UnionWithSameStringTypes(
        UnionWithSameStringTypes.RegularString value
    ) => new(value);

    public static implicit operator UnionWithSameStringTypes(
        UnionWithSameStringTypes.PatternString value
    ) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithSameStringTypes>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithSameStringTypes).IsAssignableFrom(typeToConvert);

        public override UnionWithSameStringTypes Read(
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
                "customFormat" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "regularString" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                "patternString" => json.GetProperty("value").Deserialize<string?>(options)
                ?? throw new JsonException("Failed to deserialize string"),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithSameStringTypes(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithSameStringTypes value,
            JsonSerializerOptions options
        )
        {
            JsonObject json =
                value.Type switch
                {
                    "customFormat" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "regularString" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "patternString" => new JsonObject
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
    /// Discriminated union type for customFormat
    /// </summary>
    [Serializable]
    public record CustomFormat
    {
        public CustomFormat(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator UnionWithSameStringTypes.CustomFormat(string value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for regularString
    /// </summary>
    [Serializable]
    public record RegularString
    {
        public RegularString(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator UnionWithSameStringTypes.RegularString(string value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for patternString
    /// </summary>
    [Serializable]
    public record PatternString
    {
        public PatternString(string value)
        {
            Value = value;
        }

        internal string Value { get; set; }

        public override string ToString() => Value;

        public static implicit operator UnionWithSameStringTypes.PatternString(string value) =>
            new(value);
    }
}
