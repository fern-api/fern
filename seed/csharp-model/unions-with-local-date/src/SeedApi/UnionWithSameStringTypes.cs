// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

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
    /// Returns the value as a <see cref="SeedApi.UnionWithSameStringTypesCustomFormat"/> if <see cref="Type"/> is 'customFormat', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'customFormat'.</exception>
    public SeedApi.UnionWithSameStringTypesCustomFormat AsCustomFormat() =>
        IsCustomFormat
            ? (SeedApi.UnionWithSameStringTypesCustomFormat)Value!
            : throw new global::System.Exception(
                "UnionWithSameStringTypes.Type is not 'customFormat'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithSameStringTypesRegularString"/> if <see cref="Type"/> is 'regularString', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'regularString'.</exception>
    public SeedApi.UnionWithSameStringTypesRegularString AsRegularString() =>
        IsRegularString
            ? (SeedApi.UnionWithSameStringTypesRegularString)Value!
            : throw new global::System.Exception(
                "UnionWithSameStringTypes.Type is not 'regularString'"
            );

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithSameStringTypesPatternString"/> if <see cref="Type"/> is 'patternString', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'patternString'.</exception>
    public SeedApi.UnionWithSameStringTypesPatternString AsPatternString() =>
        IsPatternString
            ? (SeedApi.UnionWithSameStringTypesPatternString)Value!
            : throw new global::System.Exception(
                "UnionWithSameStringTypes.Type is not 'patternString'"
            );

    public T Match<T>(
        Func<SeedApi.UnionWithSameStringTypesCustomFormat, T> onCustomFormat,
        Func<SeedApi.UnionWithSameStringTypesRegularString, T> onRegularString,
        Func<SeedApi.UnionWithSameStringTypesPatternString, T> onPatternString,
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
        Action<SeedApi.UnionWithSameStringTypesCustomFormat> onCustomFormat,
        Action<SeedApi.UnionWithSameStringTypesRegularString> onRegularString,
        Action<SeedApi.UnionWithSameStringTypesPatternString> onPatternString,
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
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithSameStringTypesCustomFormat"/> and returns true if successful.
    /// </summary>
    public bool TryAsCustomFormat(out SeedApi.UnionWithSameStringTypesCustomFormat? value)
    {
        if (Type == "customFormat")
        {
            value = (SeedApi.UnionWithSameStringTypesCustomFormat)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithSameStringTypesRegularString"/> and returns true if successful.
    /// </summary>
    public bool TryAsRegularString(out SeedApi.UnionWithSameStringTypesRegularString? value)
    {
        if (Type == "regularString")
        {
            value = (SeedApi.UnionWithSameStringTypesRegularString)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithSameStringTypesPatternString"/> and returns true if successful.
    /// </summary>
    public bool TryAsPatternString(out SeedApi.UnionWithSameStringTypesPatternString? value)
    {
        if (Type == "patternString")
        {
            value = (SeedApi.UnionWithSameStringTypesPatternString)Value!;
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

            // Strip the discriminant property to prevent it from leaking into AdditionalProperties
            var jsonObject = System.Text.Json.Nodes.JsonObject.Create(json);
            jsonObject?.Remove("type");
            var jsonWithoutDiscriminator =
                jsonObject != null ? JsonSerializer.SerializeToElement(jsonObject, options) : json;

            var value = discriminator switch
            {
                "customFormat" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithSameStringTypesCustomFormat?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithSameStringTypesCustomFormat"
                        ),
                "regularString" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithSameStringTypesRegularString?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithSameStringTypesRegularString"
                        ),
                "patternString" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithSameStringTypesPatternString?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithSameStringTypesPatternString"
                        ),
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
            JsonNode json =
                value.Type switch
                {
                    "customFormat" => JsonSerializer.SerializeToNode(value.Value, options),
                    "regularString" => JsonSerializer.SerializeToNode(value.Value, options),
                    "patternString" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override UnionWithSameStringTypes ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new UnionWithSameStringTypes(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithSameStringTypes value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for customFormat
    /// </summary>
    [Serializable]
    public struct CustomFormat
    {
        public CustomFormat(SeedApi.UnionWithSameStringTypesCustomFormat value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithSameStringTypesCustomFormat Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithSameStringTypes.CustomFormat(
            SeedApi.UnionWithSameStringTypesCustomFormat value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for regularString
    /// </summary>
    [Serializable]
    public struct RegularString
    {
        public RegularString(SeedApi.UnionWithSameStringTypesRegularString value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithSameStringTypesRegularString Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithSameStringTypes.RegularString(
            SeedApi.UnionWithSameStringTypesRegularString value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for patternString
    /// </summary>
    [Serializable]
    public struct PatternString
    {
        public PatternString(SeedApi.UnionWithSameStringTypesPatternString value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithSameStringTypesPatternString Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithSameStringTypes.PatternString(
            SeedApi.UnionWithSameStringTypesPatternString value
        ) => new(value);
    }
}
