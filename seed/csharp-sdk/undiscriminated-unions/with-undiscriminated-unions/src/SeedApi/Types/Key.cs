// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

[JsonConverter(typeof(Key.JsonConverter))]
[Serializable]
public class Key
{
    private Key(string type, object? value)
    {
        Type = type;
        Value = value;
    }

    /// <summary>
    /// Type discriminator
    /// </summary>
    [JsonIgnore]
    public string Type { get; internal set; }

    /// <summary>
    /// Union value
    /// </summary>
    [JsonIgnore]
    public object? Value { get; internal set; }

    /// <summary>
    /// Factory method to create a union from a SeedApi.KeyType value.
    /// </summary>
    public static Key FromKeyType(SeedApi.KeyType value) => new("keyType", value);

    /// <summary>
    /// Factory method to create a union from a SeedApi.KeyOne value.
    /// </summary>
    public static Key FromKeyOne(SeedApi.KeyOne value) => new("keyOne", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "keyType"
    /// </summary>
    public bool IsKeyType() => Type == "keyType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "keyOne"
    /// </summary>
    public bool IsKeyOne() => Type == "keyOne";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.KeyType"/> if <see cref="Type"/> is 'keyType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'keyType'.</exception>
    public SeedApi.KeyType AsKeyType() =>
        IsKeyType()
            ? (SeedApi.KeyType)Value!
            : throw new SeedApiException("Union type is not 'keyType'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.KeyOne"/> if <see cref="Type"/> is 'keyOne', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'keyOne'.</exception>
    public SeedApi.KeyOne AsKeyOne() =>
        IsKeyOne()
            ? (SeedApi.KeyOne)Value!
            : throw new SeedApiException("Union type is not 'keyOne'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.KeyType"/> and returns true if successful.
    /// </summary>
    public bool TryGetKeyType(out SeedApi.KeyType? value)
    {
        if (Type == "keyType")
        {
            value = (SeedApi.KeyType)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.KeyOne"/> and returns true if successful.
    /// </summary>
    public bool TryGetKeyOne(out SeedApi.KeyOne? value)
    {
        if (Type == "keyOne")
        {
            value = (SeedApi.KeyOne)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(Func<SeedApi.KeyType, T> onKeyType, Func<SeedApi.KeyOne, T> onKeyOne)
    {
        return Type switch
        {
            "keyType" => onKeyType(AsKeyType()),
            "keyOne" => onKeyOne(AsKeyOne()),
            _ => throw new SeedApiException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(Action<SeedApi.KeyType> onKeyType, Action<SeedApi.KeyOne> onKeyOne)
    {
        switch (Type)
        {
            case "keyType":
                onKeyType(AsKeyType());
                break;
            case "keyOne":
                onKeyOne(AsKeyOne());
                break;
            default:
                throw new SeedApiException($"Unknown union type: {Type}");
        }
    }

    public override int GetHashCode()
    {
        unchecked
        {
            var hashCode = Type.GetHashCode();
            if (Value != null)
            {
                hashCode = (hashCode * 397) ^ Value.GetHashCode();
            }
            return hashCode;
        }
    }

    public override bool Equals(object? obj)
    {
        if (obj is null)
            return false;
        if (ReferenceEquals(this, obj))
            return true;
        if (obj is not Key other)
            return false;

        // Compare type discriminators
        if (Type != other.Type)
            return false;

        // Compare values using EqualityComparer for deep comparison
        return System.Collections.Generic.EqualityComparer<object?>.Default.Equals(
            Value,
            other.Value
        );
    }

    public override string ToString() => JsonUtils.Serialize(this);

    public static implicit operator Key(SeedApi.KeyType value) => new("keyType", value);

    public static implicit operator Key(SeedApi.KeyOne value) => new("keyOne", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Key>
    {
        public override Key? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("keyType", typeof(SeedApi.KeyType)),
                    ("keyOne", typeof(SeedApi.KeyOne)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            Key result = new(key, value);
                            return result;
                        }
                    }
                    catch (JsonException)
                    {
                        // Try next type;
                    }
                }
            }

            throw new JsonException($"Cannot deserialize JSON token {reader.TokenType} into Key");
        }

        public override void Write(Utf8JsonWriter writer, Key value, JsonSerializerOptions options)
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            value.Visit(
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override Key ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            Key result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            Key value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
