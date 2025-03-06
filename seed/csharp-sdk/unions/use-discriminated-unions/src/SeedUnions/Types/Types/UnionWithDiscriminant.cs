using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithDiscriminant.JsonConverter))]
public record UnionWithDiscriminant
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of UnionWithDiscriminant with <see cref="Foo"/>.
    /// </summary>
    public UnionWithDiscriminant(Foo value)
    {
        Type = "foo";
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithDiscriminant with <see cref="Bar"/>.
    /// </summary>
    public UnionWithDiscriminant(Bar value)
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

    public static implicit operator UnionWithDiscriminant(Foo value) => new(value);

    public static implicit operator UnionWithDiscriminant(Bar value) => new(value);

    internal sealed class JsonConverter : JsonConverter<UnionWithDiscriminant>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithDiscriminant).IsAssignableFrom(typeToConvert);

        public override UnionWithDiscriminant Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var jsonObject = JsonElement.ParseValue(ref reader);
            if (!jsonObject.TryGetProperty("_type", out var discriminatorElement))
            {
                throw new JsonException("Missing discriminator property '_type'");
            }
            if (discriminatorElement.ValueKind != JsonValueKind.String)
            {
                if (discriminatorElement.ValueKind == JsonValueKind.Null)
                {
                    throw new JsonException("Discriminator property '_type' is null");
                }

                throw new JsonException(
                    $"Discriminator property '_type' is not a string, instead is {discriminatorElement.ToString()}"
                );
            }

            var discriminator =
                discriminatorElement.GetString()
                ?? throw new JsonException("Discriminator property '_type' is null");

            switch (discriminator)
            {
                case "foo":
                {
                    var value = jsonObject.Deserialize<Foo>();
                    return new UnionWithDiscriminant(value);
                }
                case "bar":
                {
                    var value = jsonObject.Deserialize<Bar>();
                    return new UnionWithDiscriminant(value);
                }
                default:
                    throw new JsonException(
                        $"Discriminator property '_type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithDiscriminant value,
            JsonSerializerOptions options
        )
        {
            var jsonNode = JsonSerializer.SerializeToNode(value.Value, options);
            if (jsonNode == null)
            {
                throw new JsonException("Failed to serialize UnionWithDiscriminant");
            }

            jsonNode.WriteTo(writer, options);
        }
    }
}
