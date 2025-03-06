using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithUnknown.JsonConverter))]
public record UnionWithUnknown
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of UnionWithUnknown with <see cref="Foo"/>.
    /// </summary>
    public UnionWithUnknown(Foo value)
    {
        Type = "foo";
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithUnknown with <see cref="object"/>.
    /// </summary>
    public UnionWithUnknown(object value)
    {
        Type = "unknown";
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
    /// Returns true if of type <see cref="Foo"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsFoo => Type == "foo";

    /// <summary>
    /// Returns true if of type <see cref="object"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsUnknown => Type == "unknown";

    /// <summary>
    /// Returns the value as a <see cref="Foo"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Foo"/>.</exception>
    public Foo AsFoo() => (Foo)Value;

    /// <summary>
    /// Returns the value as a <see cref="object"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="object"/>.</exception>
    public object AsUnknown() => (object)Value;

    public T Match<T>(Func<Foo, T> onFoo, Func<object, T> onUnknown)
    {
        return Type switch
        {
            "foo" => onFoo(AsFoo()),
            "unknown" => onUnknown(AsUnknown()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<Foo> onFoo, Action<object> onUnknown)
    {
        switch (Type)
        {
            case "foo":
                onFoo(AsFoo());
                break;
            case "unknown":
                onUnknown(AsUnknown());
                break;
            default:
                throw new Exception($"Unexpected Type: {Type}");
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="Foo"/> and returns true if successful.
    /// </summary>
    public bool TryAsFoo(out Foo? value)
    {
        if (Value is Foo asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="object"/> and returns true if successful.
    /// </summary>
    public bool TryAsUnknown(out object? value)
    {
        if (Value is object asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator UnionWithUnknown(Foo value) => new(value);

    internal sealed class JsonConverter : JsonConverter<UnionWithUnknown>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithUnknown).IsAssignableFrom(typeToConvert);

        public override UnionWithUnknown Read(
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
                case "foo":
                {
                    var value = jsonObject.Deserialize<Foo>();
                    return new UnionWithUnknown(value);
                }
                case "unknown":
                {
                    var value =
                        jsonObject.Deserialize<object>()
                        ?? throw new JsonException("Failed to deserialize object");
                    return new UnionWithUnknown(value);
                }
                default:
                    throw new JsonException(
                        $"Discriminator property 'type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithUnknown value,
            JsonSerializerOptions options
        )
        {
            var jsonNode = JsonSerializer.SerializeToNode(value.Value, options);
            if (jsonNode == null)
            {
                throw new JsonException("Failed to serialize UnionWithUnknown");
            }

            jsonNode.WriteTo(writer, options);
        }
    }
}
