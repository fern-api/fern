using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithOptionalTime.JsonConverter))]
public record UnionWithOptionalTime
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of UnionWithOptionalTime with <see cref="DateOnly?"/>.
    /// </summary>
    public UnionWithOptionalTime(DateOnly? value)
    {
        Type = "date";
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithOptionalTime with <see cref="DateTime?"/>.
    /// </summary>
    public UnionWithOptionalTime(DateTime? value)
    {
        Type = "datetime";
        Value = value;
    }

    /// <summary>
    /// Discriminant value
    /// </summary>
    [JsonPropertyName("type")]
    public string Type { get; internal set; }

    /// <summary>
    /// Discriminated union value
    /// </summary>
    [JsonIgnore]
    public object Value { get; internal set; }

    /// <summary>
    /// Returns true if of type <see cref="DateOnly?"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsDate => Type == "date";

    /// <summary>
    /// Returns true if of type <see cref="DateTime?"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsDatetime => Type == "datetime";

    /// <summary>
    /// Returns the value as a <see cref="DateOnly?"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="DateOnly?"/>.</exception>
    public DateOnly? AsDate() => (DateOnly?)Value;

    /// <summary>
    /// Returns the value as a <see cref="DateTime?"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="DateTime?"/>.</exception>
    public DateTime? AsDatetime() => (DateTime?)Value;

    public T Match<T>(Func<DateOnly?, T> onDate, Func<DateTime?, T> onDatetime)
    {
        return Type switch
        {
            "date" => onDate(AsDate()),
            "datetime" => onDatetime(AsDatetime()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<DateOnly?> onDate, Action<DateTime?> onDatetime)
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
                throw new Exception($"Unexpected Type: {Type}");
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="DateOnly?"/> and returns true if successful.
    /// </summary>
    public bool TryAsDate(out DateOnly? value)
    {
        if (Value is DateOnly asValue)
        {
            value = asValue;
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
        if (Value is DateTime asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithOptionalTime(DateOnly? value) => new(value);

    public static implicit operator UnionWithOptionalTime(DateTime? value) => new(value);

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
            var jsonObject = JsonElement.ParseValue(ref reader);
            if (!jsonObject.TryGetProperty("type", out var discriminatorElement))
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
                case "date":
                {
                    var value =
                        jsonObject.Deserialize<DateOnly?>()
                        ?? throw new JsonException("Failed to deserialize DateOnly?");
                    return new UnionWithOptionalTime(value);
                }
                case "datetime":
                {
                    var value =
                        jsonObject.Deserialize<DateTime?>()
                        ?? throw new JsonException("Failed to deserialize DateTime?");
                    return new UnionWithOptionalTime(value);
                }
                default:
                    throw new JsonException(
                        $"Discriminator property 'type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithOptionalTime value,
            JsonSerializerOptions options
        )
        {
            var jsonNode = JsonSerializer.SerializeToNode(value.Value, options);
            if (jsonNode == null)
            {
                throw new JsonException("Failed to serialize UnionWithOptionalTime");
            }

            jsonNode.WriteTo(writer, options);
        }
    }
}
