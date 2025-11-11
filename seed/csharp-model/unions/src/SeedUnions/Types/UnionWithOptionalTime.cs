// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

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
    /// Returns the value as a <see cref="DateOnly?"/> if <see cref="Type"/> is 'date', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'date'.</exception>
    public DateOnly? AsDate() =>
        IsDate
            ? (DateOnly?)Value!
            : throw new System.Exception("UnionWithOptionalTime.Type is not 'date'");

    /// <summary>
    /// Returns the value as a <see cref="DateTime?"/> if <see cref="Type"/> is 'datetime', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'datetime'.</exception>
    public DateTime? AsDatetime() =>
        IsDatetime
            ? (DateTime?)Value!
            : throw new System.Exception("UnionWithOptionalTime.Type is not 'datetime'");

    public T Match<T>(
        Func<DateOnly?, T> onDate,
        Func<DateTime?, T> onDatetime,
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
        Action<DateOnly?> onDate,
        Action<DateTime?> onDatetime,
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
    /// Attempts to cast the value to a <see cref="DateOnly?"/> and returns true if successful.
    /// </summary>
    public bool TryAsDate(out DateOnly? value)
    {
        if (Type == "date")
        {
            value = (DateOnly?)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DateTime?"/> and returns true if successful.
    /// </summary>
    public bool TryAsDatetime(out DateTime? value)
    {
        if (Type == "datetime")
        {
            value = (DateTime?)Value!;
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

            var value = discriminator switch
            {
                "date" => json.GetProperty("value").Deserialize<DateOnly?>(options),
                "datetime" => json.GetProperty("value").Deserialize<DateTime?>(options),
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
            JsonObject json =
                value.Type switch
                {
                    "date" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "datetime" => new JsonObject
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
    /// Discriminated union type for date
    /// </summary>
    [Serializable]
    public record Date
    {
        public Date(DateOnly? value)
        {
            Value = value;
        }

        internal DateOnly? Value { get; set; }

        public override string ToString() => Value?.ToString() ?? "null";

        public static implicit operator UnionWithOptionalTime.Date(DateOnly? value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for datetime
    /// </summary>
    [Serializable]
    public record Datetime
    {
        public Datetime(DateTime? value)
        {
            Value = value;
        }

        internal DateTime? Value { get; set; }

        public override string ToString() => Value?.ToString() ?? "null";

        public static implicit operator UnionWithOptionalTime.Datetime(DateTime? value) =>
            new(value);
    }
}
