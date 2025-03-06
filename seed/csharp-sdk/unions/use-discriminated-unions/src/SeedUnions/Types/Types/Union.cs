using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

/// <summary>
/// This is a simple union.
/// </summary>
[JsonConverter(typeof(Union.JsonConverter))]
public record Union
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of Union with <see cref="Foo"/>.
    /// </summary>
    public Union(Foo value)
    {
        Type = "foo";
        Value = value;
    }

    /// <summary>
    /// Create an instance of Union with <see cref="Bar"/>.
    /// </summary>
    public Union(Bar value)
    {
        Type = "bar";
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
    /// Returns true if of type <see cref="Bar"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsBar => Type == "bar";

    /// <summary>
    /// Returns the value as a <see cref="Foo"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Foo"/>.</exception>
    public Foo AsFoo() => (Foo)Value;

    /// <summary>
    /// Returns the value as a <see cref="Bar"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Bar"/>.</exception>
    public Bar AsBar() => (Bar)Value;

    public T Match<T>(Func<Foo, T> onFoo, Func<Bar, T> onBar)
    {
        return Type switch
        {
            "foo" => onFoo(AsFoo()),
            "bar" => onBar(AsBar()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<Foo> onFoo, Action<Bar> onBar)
    {
        switch (Type)
        {
            case "foo":
                onFoo(AsFoo());
                break;
            case "bar":
                onBar(AsBar());
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
    /// Attempts to cast the value to a <see cref="Bar"/> and returns true if successful.
    /// </summary>
    public bool TryAsBar(out Bar? value)
    {
        if (Value is Bar asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator Union(Foo value) => new(value);

    public static implicit operator Union(Bar value) => new(value);

    internal sealed class JsonConverter : JsonConverter<Union>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(Union).IsAssignableFrom(typeToConvert);

        public override Union Read(
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
                    return new Union(value);
                }
                case "bar":
                {
                    var value = jsonObject.Deserialize<Bar>();
                    return new Union(value);
                }
                default:
                    throw new JsonException(
                        $"Discriminator property 'type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            Union value,
            JsonSerializerOptions options
        )
        {
            var jsonNode = JsonSerializer.SerializeToNode(value.Value, options);
            if (jsonNode == null)
            {
                throw new JsonException("Failed to serialize Union");
            }

            jsonNode.WriteTo(writer, options);
        }
    }
}
