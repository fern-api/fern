using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithTime.JsonConverter))]
public record UnionWithTime
{
    internal UnionWithTime(string type, object value)
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
    public object Value { get; internal set; }

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
        IsValue ? (int)Value : throw new Exception("UnionWithTime.Type is not 'value'");

    /// <summary>
    /// Returns the value as a <see cref="DateOnly"/> if <see cref="Type"/> is 'date', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'date'.</exception>
    public DateOnly AsDate() =>
        IsDate ? (DateOnly)Value : throw new Exception("UnionWithTime.Type is not 'date'");

    /// <summary>
    /// Returns the value as a <see cref="DateTime"/> if <see cref="Type"/> is 'datetime', otherwise throws an exception.
    /// </summary>
    /// <exception cref="Exception">Thrown when <see cref="Type"/> is not 'datetime'.</exception>
    public DateTime AsDatetime() =>
        IsDatetime ? (DateTime)Value : throw new Exception("UnionWithTime.Type is not 'datetime'");

    public T Match<T>(
        Func<int, T> onValue,
        Func<DateOnly, T> onDate,
        Func<DateTime, T> onDatetime,
        Func<string, object, T> _onUnknown
    )
    {
        return Type switch
        {
            "value" => onValue(AsValue()),
            "date" => onDate(AsDate()),
            "datetime" => onDatetime(AsDatetime()),
            _ => _onUnknown(Type, Value),
        };
    }

    public void Visit(
        Action<int> onValue,
        Action<DateOnly> onDate,
        Action<DateTime> onDatetime,
        Action<string, object> _onUnknown
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
                _onUnknown(Type, Value);
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
            value = (int)Value;
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
            value = (DateOnly)Value;
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
            value = (DateTime)Value;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithTime(UnionWithTime.ValueInner value) => new(value);

    public static implicit operator UnionWithTime(UnionWithTime.Date value) => new(value);

    public static implicit operator UnionWithTime(UnionWithTime.Datetime value) => new(value);

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

            switch (discriminator)
            {
                case "value":
                {
                    var value = json.Deserialize<int>(options);
                    return new UnionWithTime("value", value);
                }
                case "date":
                {
                    var value = json.Deserialize<DateOnly>(options);
                    return new UnionWithTime("date", value);
                }
                case "datetime":
                {
                    var value = json.Deserialize<DateTime>(options);
                    return new UnionWithTime("datetime", value);
                }
                default:
                    throw new JsonException(
                        $"Discriminator property 'type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithTime value,
            JsonSerializerOptions options
        )
        {
            var json = JsonSerializer.SerializeToNode(value.Value, options) 
                       ?? throw new JsonException("Failed to serialize UnionWithTime");
            json["type"] = value.Type;
            var basePropertiesJson = JsonSerializer.SerializeToNode(new UnionWithTime.BaseProperties
            {
                
            }, options) ?? throw new JsonException("Failed to serialize UnionWithTime.BaseProperties");
            foreach (var property in basePropertiesJson.AsObject())
            {
                json[property.Key] = property.Value;
            }

            json.WriteTo(writer, options);
        }
    }

    /// <summary>
    /// Discriminated union type for value
    /// </summary>
    public struct ValueInner
    {
        public ValueInner(int value)
        {
            Value = value;
        }

        internal int Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator ValueInner(int value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for date
    /// </summary>
    public struct Date
    {
        public Date(DateOnly value)
        {
            Value = value;
        }

        internal DateOnly Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Date(DateOnly value) => new(value);
    }

    /// <summary>
    /// Discriminated union type for datetime
    /// </summary>
    public struct Datetime
    {
        public Datetime(DateTime value)
        {
            Value = value;
        }

        internal DateTime Value { get; set; }

        public override string ToString() => Value.ToString();

        public static implicit operator Datetime(DateTime value) => new(value);
    }
}
