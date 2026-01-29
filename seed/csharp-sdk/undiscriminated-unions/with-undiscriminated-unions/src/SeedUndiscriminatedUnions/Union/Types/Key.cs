// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

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
    /// Factory method to create a union from a SeedUndiscriminatedUnions.KeyType value.
    /// </summary>
    public static Key FromKeyType(SeedUndiscriminatedUnions.KeyType value) => new("keyType", value);

    /// <summary>
    /// Factory method to create a union with the literal value "default".
    /// </summary>
    public static Key FromDefault() => new("default", "default");

    /// <summary>
    /// Returns true if <see cref="Type"/> is "keyType"
    /// </summary>
    public bool IsKeyType() => Type == "keyType";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "default"
    /// </summary>
    public bool IsDefault() => Type == "default";

    /// <summary>
    /// Returns the value as a <see cref="SeedUndiscriminatedUnions.KeyType"/> if <see cref="Type"/> is 'keyType', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'keyType'.</exception>
    public SeedUndiscriminatedUnions.KeyType AsKeyType() =>
        IsKeyType()
            ? (SeedUndiscriminatedUnions.KeyType)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'keyType'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'default', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'default'.</exception>
    public string AsDefault() =>
        IsDefault()
            ? (string)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'default'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedUndiscriminatedUnions.KeyType"/> and returns true if successful.
    /// </summary>
    public bool TryGetKeyType(out SeedUndiscriminatedUnions.KeyType? value)
    {
        if (Type == "keyType")
        {
            value = (SeedUndiscriminatedUnions.KeyType)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryGetDefault(out string? value)
    {
        if (Type == "default")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<SeedUndiscriminatedUnions.KeyType, T> onKeyType,
        Func<string, T> onDefault
    )
    {
        return Type switch
        {
            "keyType" => onKeyType(AsKeyType()),
            "default" => onDefault(AsDefault()),
            _ => throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(Action<SeedUndiscriminatedUnions.KeyType> onKeyType, Action<string> onDefault)
    {
        switch (Type)
        {
            case "keyType":
                onKeyType(AsKeyType());
                break;
            case "default":
                onDefault(AsDefault());
                break;
            default:
                throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}");
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

    public static implicit operator Key(SeedUndiscriminatedUnions.KeyType value) =>
        new("keyType", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<Key>
    {
        public override Key? Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            if (reader.TokenType == JsonTokenType.String)
            {
                var stringValue = reader.GetString()!;

                if (stringValue == "default")
                {
                    Key literalResult = new("default", stringValue);
                    return literalResult;
                }
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("keyType", typeof(SeedUndiscriminatedUnions.KeyType)),
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

        public override Key? ReadAsPropertyName(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
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
