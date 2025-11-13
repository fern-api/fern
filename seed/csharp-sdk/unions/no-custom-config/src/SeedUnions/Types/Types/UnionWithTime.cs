// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Nodes;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

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
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'value', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'value'.</exception>
    public int AsValue() =>
        IsValue ? (int)Value! : throw new System.Exception("UnionWithTime.Type is not 'value'");

    /// <summary>
    /// Returns the value as a <see cref="DateOnly"/> if <see cref="Type"/> is 'date', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'date'.</exception>
    public DateOnly AsDate() =>
        IsDate ? (DateOnly)Value! : throw new System.Exception("UnionWithTime.Type is not 'date'");

    /// <summary>
    /// Returns the value as a <see cref="DateTime"/> if <see cref="Type"/> is 'datetime', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'datetime'.</exception>
    public DateTime AsDatetime() =>
        IsDatetime
            ? (DateTime)Value!
            : throw new System.Exception("UnionWithTime.Type is not 'datetime'");

    public T Match<T>(
        Func<int, T> onValue,
        Func<DateOnly, T> onDate,
        Func<DateTime, T> onDatetime,
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
        Action<int> onValue,
        Action<DateOnly> onDate,
        Action<DateTime> onDatetime,
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
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryAsValue(out int? value)
    {
        if (Type == "value")
        {
            value = (int)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DateOnly"/> and returns true if successful.
    /// </summary>
    public bool TryAsDate(out DateOnly? value)
    {
        if (Type == "date")
        {
            value = (DateOnly)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DateTime"/> and returns true if successful.
    /// </summary>
    public bool TryAsDatetime(out DateTime? value)
    {
        if (Type == "datetime")
        {
            value = (DateTime)Value!;
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
        public override bool CanConvert(System.Type typeToConvert) =>
            typeof(UnionWithTime).IsAssignableFrom(typeToConvert);

        public override UnionWithTime Read(
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
                "value" => json.GetProperty("value").Deserialize<int>(options),
                "date" => json.GetProperty("value").Deserialize<DateOnly>(options),
                "datetime" => json.GetProperty("value").Deserialize<DateTime>(options),
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
                    "value" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "date" => new JsonObject
                    {
                        ["value"] = JsonSerializer.SerializeToNode(value.Value, options),
                    },
                    "datetime" => new JsonObject
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
    /// Discriminated union type for value
    /// </summary>
    [Serializable]
    public struct ValueInner
    {
        public ValueInner(int value)
        {
            Value = value;
        }

        internal int Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithTime.ValueInner(int value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for date
    /// </summary>
    [Serializable]
    public struct Date
    {
        public Date(DateOnly value)
        {
            Value = value;
        }

        internal DateOnly Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithTime.Date(DateOnly value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for datetime
    /// </summary>
    [Serializable]
    public struct Datetime
    {
        public Datetime(DateTime value)
        {
            Value = value;
        }

        internal DateTime Value { get; set; }

        public override string ToString() => Value.ToString() ?? "null";

        public static implicit operator UnionWithTime.Datetime(DateTime value) => new(value);
    }
}
