// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Nodes;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(UnionWithTime.JsonConverter))]
[Serializable]
public record UnionWithTime
{
    internal UnionWithTime(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithTime with <see cref="UnionWithTime.ValueInner"/>.
    /// </summary>
    public UnionWithTime(UnionWithTime.ValueInner value)
    {
        Type = "value";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithTime with <see cref="UnionWithTime.Date"/>.
    /// </summary>
    public UnionWithTime(UnionWithTime.Date value)
    {
        Type = "date";
        Value = value.Value;
    }

    /// <summary>
    /// Create an instance of UnionWithTime with <see cref="UnionWithTime.Datetime"/>.
    /// </summary>
    public UnionWithTime(UnionWithTime.Datetime value)
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
    /// Returns true if <see cref="Type"/> is "value"
    /// </summary>
    public bool IsValue => Type == "value";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "date"
    /// </summary>
    public bool IsDate => Type == "date";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "datetime"
    /// </summary>
    public bool IsDatetime => Type == "datetime";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithTimeValue"/> if <see cref="Type"/> is 'value', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'value'.</exception>
    public SeedApi.UnionWithTimeValue AsValue() =>
        IsValue
            ? (SeedApi.UnionWithTimeValue)Value!
            : throw new global::System.Exception("UnionWithTime.Type is not 'value'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithTimeDate"/> if <see cref="Type"/> is 'date', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'date'.</exception>
    public SeedApi.UnionWithTimeDate AsDate() =>
        IsDate
            ? (SeedApi.UnionWithTimeDate)Value!
            : throw new global::System.Exception("UnionWithTime.Type is not 'date'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithTimeDatetime"/> if <see cref="Type"/> is 'datetime', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'datetime'.</exception>
    public SeedApi.UnionWithTimeDatetime AsDatetime() =>
        IsDatetime
            ? (SeedApi.UnionWithTimeDatetime)Value!
            : throw new global::System.Exception("UnionWithTime.Type is not 'datetime'");

    public T Match<T>(
        Func<SeedApi.UnionWithTimeValue, T> onValue,
        Func<SeedApi.UnionWithTimeDate, T> onDate,
        Func<SeedApi.UnionWithTimeDatetime, T> onDatetime,
        Func<string, object?, T> onUnknown_
    )
    {
        return Type switch
        {
            "value" => onValue(AsValue()),
            "date" => onDate(AsDate()),
            "datetime" => onDatetime(AsDatetime()),
            _ => onUnknown_(Type, Value),
        };
    }

    public void Visit(
        Action<SeedApi.UnionWithTimeValue> onValue,
        Action<SeedApi.UnionWithTimeDate> onDate,
        Action<SeedApi.UnionWithTimeDatetime> onDatetime,
        Action<string, object?> onUnknown_
    )
    {
        switch (Type)
        {
            case "value":
                onValue(AsValue());
                break;
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
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithTimeValue"/> and returns true if successful.
    /// </summary>
    public bool TryAsValue(out SeedApi.UnionWithTimeValue? value)
    {
        if (Type == "value")
        {
            value = (SeedApi.UnionWithTimeValue)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithTimeDate"/> and returns true if successful.
    /// </summary>
    public bool TryAsDate(out SeedApi.UnionWithTimeDate? value)
    {
        if (Type == "date")
        {
            value = (SeedApi.UnionWithTimeDate)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithTimeDatetime"/> and returns true if successful.
    /// </summary>
    public bool TryAsDatetime(out SeedApi.UnionWithTimeDatetime? value)
    {
        if (Type == "datetime")
        {
            value = (SeedApi.UnionWithTimeDatetime)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithTime(UnionWithTime.ValueInner value) => new(value);

    public static implicit operator UnionWithTime(UnionWithTime.Date value) => new(value);

    public static implicit operator UnionWithTime(UnionWithTime.Datetime value) => new(value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithTime>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithTime).IsAssignableFrom(typeToConvert);

        public override UnionWithTime Read(
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
                "value" => jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithTimeValue?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.UnionWithTimeValue"),
                "date" => jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithTimeDate?>(options)
                    ?? throw new JsonException("Failed to deserialize SeedApi.UnionWithTimeDate"),
                "datetime" => jsonWithoutDiscriminator.Deserialize<SeedApi.UnionWithTimeDatetime?>(
                    options
                ) ?? throw new JsonException("Failed to deserialize SeedApi.UnionWithTimeDatetime"),
                _ => json.Deserialize<object?>(options),
            };
            return new UnionWithTime(discriminator, value);
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithTime value,
            JsonSerializerOptions options
        )
        {
            JsonNode json =
                value.Type switch
                {
                    "value" => JsonSerializer.SerializeToNode(value.Value, options),
                    "date" => JsonSerializer.SerializeToNode(value.Value, options),
                    "datetime" => JsonSerializer.SerializeToNode(value.Value, options),
                    _ => JsonSerializer.SerializeToNode(value.Value, options),
                } ?? new JsonObject();
            json["type"] = value.Type;
            json.WriteTo(writer, options);
        }

        public override UnionWithTime ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue =
                reader.GetString()
                ?? throw new JsonException("The JSON property name could not be read as a string.");
            return new UnionWithTime(stringValue, stringValue);
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithTime value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Type);
        }
    }

    /// <summary>
    /// Discriminated union type for value
    /// </summary>
    [Serializable]
    public struct ValueInner
    {
        public ValueInner(SeedApi.UnionWithTimeValue value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithTimeValue Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithTime.ValueInner(
            SeedApi.UnionWithTimeValue value
        ) => new(value);
    }

    /// <summary>
    /// Discriminated union type for date
    /// </summary>
    [Serializable]
    public struct Date
    {
        public Date(SeedApi.UnionWithTimeDate value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithTimeDate Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithTime.Date(SeedApi.UnionWithTimeDate value) =>
            new(value);
    }

    /// <summary>
    /// Discriminated union type for datetime
    /// </summary>
    [Serializable]
    public struct Datetime
    {
        public Datetime(SeedApi.UnionWithTimeDatetime value)
        {
            Value = value;
        }

        internal SeedApi.UnionWithTimeDatetime Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithTime.Datetime(
            SeedApi.UnionWithTimeDatetime value
        ) => new(value);
    }
}
