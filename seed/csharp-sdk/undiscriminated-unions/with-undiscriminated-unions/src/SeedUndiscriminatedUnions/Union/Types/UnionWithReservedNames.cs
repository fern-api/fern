// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

/// <summary>
/// Tests that union members named 'Type' or 'Value' don't collide with internal properties
/// </summary>
[JsonConverter(typeof(UnionWithReservedNames.JsonConverter))]
[Serializable]
public class UnionWithReservedNames
{
    private UnionWithReservedNames(string type, object? value)
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
    /// Factory method to create a union with the literal value "type".
    /// </summary>
    public static UnionWithReservedNames FromTypeMember() => new("type", "type");

    /// <summary>
    /// Factory method to create a union with the literal value "value".
    /// </summary>
    public static UnionWithReservedNames FromValueMember() => new("value", "value");

    /// <summary>
    /// Factory method to create a union from a string value.
    /// </summary>
    public static UnionWithReservedNames FromString(string value) => new("string", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "type"
    /// </summary>
    public bool IsTypeMember() => Type == "type";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "value"
    /// </summary>
    public bool IsValueMember() => Type == "value";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString() => Type == "string";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'type', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'type'.</exception>
    public string AsTypeMember() =>
        IsTypeMember()
            ? (string)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'type'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'value', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'value'.</exception>
    public string AsValueMember() =>
        IsValueMember()
            ? (string)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'value'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public string AsString() =>
        IsString()
            ? (string)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'string'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryGetTypeMember(out string? value)
    {
        if (Type == "type")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryGetValueMember(out string? value)
    {
        if (Type == "value")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryGetString(out string? value)
    {
        if (Type == "string")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<string, T> onTypeMember,
        Func<string, T> onValueMember,
        Func<string, T> onString
    )
    {
        return Type switch
        {
            "type" => onTypeMember(AsTypeMember()),
            "value" => onValueMember(AsValueMember()),
            "string" => onString(AsString()),
            _ => throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<string> onTypeMember,
        Action<string> onValueMember,
        Action<string> onString
    )
    {
        switch (Type)
        {
            case "type":
                onTypeMember(AsTypeMember());
                break;
            case "value":
                onValueMember(AsValueMember());
                break;
            case "string":
                onString(AsString());
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
        if (obj is not UnionWithReservedNames other)
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

    public static implicit operator UnionWithReservedNames(string value) => new("string", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithReservedNames>
    {
        public override UnionWithReservedNames? Read(
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

                if (stringValue == "type")
                {
                    UnionWithReservedNames literalResult = new("type", stringValue);
                    return literalResult;
                }

                if (stringValue == "value")
                {
                    UnionWithReservedNames literalResult = new("value", stringValue);
                    return literalResult;
                }

                UnionWithReservedNames stringResult = new("string", stringValue);
                return stringResult;
            }

            throw new JsonException(
                $"Cannot deserialize JSON token {reader.TokenType} into UnionWithReservedNames"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithReservedNames value,
            JsonSerializerOptions options
        )
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            value.Visit(
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options),
                str => writer.WriteStringValue(str)
            );
        }

        public override UnionWithReservedNames? ReadAsPropertyName(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            UnionWithReservedNames result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithReservedNames value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
