// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithOptionalTime.JsonConverter))]
[Serializable]
public record UnionWithOptionalTime
{
    internal UnionWithOptionalTime(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithOptionalTime with <see cref="UnionWithOptionalTime.Date"/>.
    /// </summary>
    public UnionWithOptionalTime(UnionWithOptionalTime.Date value)
    {
        Type = "date";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithOptionalTime with <see cref="UnionWithOptionalTime.Datetime"/>.
    /// </summary>
    public UnionWithOptionalTime(UnionWithOptionalTime.Datetime value)
    {
        Type = "datetime";
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
    /// Returns true if <see cref="Type"/> is "date"
    /// </summary>
    public bool IsDate => Type == "date";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "datetime"
    /// </summary>
    public bool IsDatetime => Type == "datetime";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithOptionalTimeDate"/> if <see cref="Type"/> is 'date', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'date'.</exception>
    public SeedApi.UnionWithOptionalTimeDate AsDate() =>
        IsDate
            ? (SeedApi.UnionWithOptionalTimeDate)Value!
            : throw new global::System.Exception("UnionWithOptionalTime.Type is not 'date'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithOptionalTimeDatetime"/> if <see cref="Type"/> is 'datetime', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'datetime'.</exception>
    public SeedApi.UnionWithOptionalTimeDatetime AsDatetime() =>
        IsDatetime
            ? (SeedApi.UnionWithOptionalTimeDatetime)Value!
            : throw new global::System.Exception("UnionWithOptionalTime.Type is not 'datetime'");

    public T Match<T>(
        Func<SeedApi.UnionWithOptionalTimeDate, T> onDate,
        Func<SeedApi.UnionWithOptionalTimeDatetime, T> onDatetime,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "date" => onDate(AsDate()),
            "datetime" => onDatetime(AsDatetime()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.UnionWithOptionalTimeDate> onDate,
        Action<SeedApi.UnionWithOptionalTimeDatetime> onDatetime,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "date":
                onDate(AsDate());
                break;
            case "datetime":
                onDatetime(AsDatetime());
                break;
            default:
                onUnknown_(Type, Value);
                break;
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithOptionalTimeDate"/> and returns true if successful.
    /// </summary>
    public bool TryAsDate(out SeedApi.UnionWithOptionalTimeDate? value)
    {
        if (Type == "date")
        {
            value = (SeedApi.UnionWithOptionalTimeDate)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithOptionalTimeDatetime"/> and returns true if successful.
    /// </summary>
    public bool TryAsDatetime(out SeedApi.UnionWithOptionalTimeDatetime? value)
    {
        if (Type == "datetime")
        {
            value = (SeedApi.UnionWithOptionalTimeDatetime)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithOptionalTime(UnionWithOptionalTime.Date value) =>
        new(value);

    public static implicit operator UnionWithOptionalTime(UnionWithOptionalTime.Datetime value) =>
        new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithOptionalTime>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithOptionalTime).IsAssignableFrom(typeToConvert);

        public override UnionWithOptionalTime Read(
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
                "date" => jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithOptionalTimeDate?>(
                    options
                )
                    ?? throw new JsonException(
                        "Failed to deserialize SeedApi.UnionWithOptionalTimeDate"
                    ),
                "datetime" =>
                    jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithOptionalTimeDatetime?>(
                        options
                    )
                        ?? throw new JsonException(
                            "Failed to deserialize SeedApi.UnionWithOptionalTimeDatetime"
                        ),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithOptionalTime(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithOptionalTime value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "date" => JsonSerializer.SerializeToNode(value.Value, options),
                    "datetime" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override UnionWithOptionalTime ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new UnionWithOptionalTime(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithOptionalTime value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for date
    /// </summary>
    [Serializable]
    public struct Date
    {
        public Date(SeedApi.UnionWithOptionalTimeDate value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithOptionalTimeDate Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithOptionalTime.Date(
            SeedApi.UnionWithOptionalTimeDate value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for datetime
    /// </summary>
    [Serializable]
    public struct Datetime
    {
        public Datetime(SeedApi.UnionWithOptionalTimeDatetime value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithOptionalTimeDatetime Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithOptionalTime.Datetime(
            SeedApi.UnionWithOptionalTimeDatetime value
        ) => new(value);
    }
}
