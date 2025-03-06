using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUnions.Core;

namespace SeedUnions;

[JsonConverter(typeof(UnionWithBaseProperties.JsonConverter))]
public record UnionWithBaseProperties
{
    /// <summary>
    /// Discriminator property name for serialization/deserialization
    /// </summary>
    internal const string DiscriminatorName = "type";

    /// <summary>
    /// Create an instance of UnionWithBaseProperties with <see cref="int"/>.
    /// </summary>
    public UnionWithBaseProperties(int value)
    {
        Type = "integer";
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithBaseProperties with <see cref="string"/>.
    /// </summary>
    public UnionWithBaseProperties(string value)
    {
        Type = "string";
        Value = value;
    }

    /// <summary>
    /// Create an instance of UnionWithBaseProperties with <see cref="Foo"/>.
    /// </summary>
    public UnionWithBaseProperties(Foo value)
    {
        Type = "foo";
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

    [JsonPropertyName("id")]
    public required string Id { get; set; }

    /// <summary>
    /// Returns true if of type <see cref="int"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsInteger => Type == "integer";

    /// <summary>
    /// Returns true if of type <see cref="string"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsString => Type == "string";

    /// <summary>
    /// Returns true if of type <see cref="Foo"/>.
    /// </summary>
    [JsonIgnore]
    public bool IsFoo => Type == "foo";

    /// <summary>
    /// Returns the value as a <see cref="int"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="int"/>.</exception>
    public int AsInteger() => (int)Value;

    /// <summary>
    /// Returns the value as a <see cref="string"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="string"/>.</exception>
    public string AsString() => (string)Value;

    /// <summary>
    /// Returns the value as a <see cref="Foo"/> if it is of that type, otherwise throws an exception.
    /// </summary>
    /// <exception cref="InvalidCastException">Thrown when the value is not an instance of <see cref="Foo"/>.</exception>
    public Foo AsFoo() => (Foo)Value;

    public T Match<T>(Func<int, T> onInteger, Func<string, T> onString, Func<Foo, T> onFoo)
    {
        return Type switch
        {
            "integer" => onInteger(AsInteger()),
            "string" => onString(AsString()),
            "foo" => onFoo(AsFoo()),
            _ => throw new Exception($"Unexpected Type: {Type}"),
        };
    }

    public void Visit(Action<int> onInteger, Action<string> onString, Action<Foo> onFoo)
    {
        switch (Type)
        {
            case "integer":
                onInteger(AsInteger());
                break;
            case "string":
                onString(AsString());
                break;
            case "foo":
                onFoo(AsFoo());
                break;
            default:
                throw new Exception($"Unexpected Type: {Type}");
        }
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryAsInteger(out int? value)
    {
        if (Value is int asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryAsString(out string? value)
    {
        if (Value is string asValue)
        {
            value = asValue;
            return true;
        }
        value = null;
        return false;
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

    public override string ToString() => JsonUtils.Serialize(this);

    internal sealed class JsonConverter : JsonConverter<UnionWithBaseProperties>
    {
        public override bool CanConvert(global::System.Type typeToConvert) =>
            typeof(UnionWithBaseProperties).IsAssignableFrom(typeToConvert);

        public override UnionWithBaseProperties Read(
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
                case "integer":
                {
                    var value = jsonObject.Deserialize<int>();
                    return new UnionWithBaseProperties(value);
                }
                case "string":
                {
                    var value =
                        jsonObject.Deserialize<string>()
                        ?? throw new JsonException("Failed to deserialize string");
                    return new UnionWithBaseProperties(value);
                }
                case "foo":
                {
                    var value = jsonObject.Deserialize<Foo>();
                    return new UnionWithBaseProperties(value);
                }
                default:
                    throw new JsonException(
                        $"Discriminator property 'type' is unexpected value '{discriminator}'"
                    );
            }
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithBaseProperties value,
            JsonSerializerOptions options
        )
        {
            var jsonNode = JsonSerializer.SerializeToNode(value.Value, options);
            if (jsonNode == null)
            {
                throw new JsonException("Failed to serialize UnionWithBaseProperties");
            }

            jsonNode.WriteTo(writer, options);
        }
    }
}
