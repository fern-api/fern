// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

/// <summary>
/// Duplicate types.
/// </summary>
[JsonConverter(typeof(UnionWithDuplicateTypes.JsonConverter))]
[Serializable]
public class UnionWithDuplicateTypes
{
    private UnionWithDuplicateTypes(string type, object? value)
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
    /// Factory method to create a union from a string value.
    /// </summary>
    public static UnionWithDuplicateTypes FromString(string value) => new("string", value);

    /// <summary>
    /// Factory method to create a union from a IEnumerable<string> value.
    /// </summary>
    public static UnionWithDuplicateTypes FromListOfString(IEnumerable<string> value) =>
        new("list", value);

    /// <summary>
    /// Factory method to create a union from a int value.
    /// </summary>
    public static UnionWithDuplicateTypes FromInt(int value) => new("int", value);

    /// <summary>
    /// Factory method to create a union from a HashSet<string> value.
    /// </summary>
    public static UnionWithDuplicateTypes FromSetOfString(HashSet<string> value) =>
        new("set", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString() => Type == "string";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "list"
    /// </summary>
    public bool IsListOfString() => Type == "list";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "int"
    /// </summary>
    public bool IsInt() => Type == "int";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "set"
    /// </summary>
    public bool IsSetOfString() => Type == "set";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public string AsString() =>
        IsString()
            ? (string)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'string'");

    /// <summary>
    /// Returns the value as a <see cref="IEnumerable<string>"/> if <see cref="Type"/> is 'list', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'list'.</exception>
    public IEnumerable<string> AsListOfString() =>
        IsListOfString()
            ? (IEnumerable<string>)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'list'");

    /// <summary>
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'int', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'int'.</exception>
    public int AsInt() =>
        IsInt()
            ? (int)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'int'");

    /// <summary>
    /// Returns the value as a <see cref="HashSet<string>"/> if <see cref="Type"/> is 'set', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'set'.</exception>
    public HashSet<string> AsSetOfString() =>
        IsSetOfString()
            ? (HashSet<string>)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'set'");

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

    /// <summary>
    /// Attempts to cast the value to a <see cref="IEnumerable<string>"/> and returns true if successful.
    /// </summary>
    public bool TryGetListOfString(out IEnumerable<string>? value)
    {
        if (Type == "list")
        {
            value = (IEnumerable<string>)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="int"/> and returns true if successful.
    /// </summary>
    public bool TryGetInt(out int? value)
    {
        if (Type == "int")
        {
            value = (int)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="HashSet<string>"/> and returns true if successful.
    /// </summary>
    public bool TryGetSetOfString(out HashSet<string>? value)
    {
        if (Type == "set")
        {
            value = (HashSet<string>)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<string, T> onString,
        Func<IEnumerable<string>, T> onListOfString,
        Func<int, T> onInt,
        Func<HashSet<string>, T> onSetOfString
    )
    {
        return Type switch
        {
            "string" => onString(AsString()),
            "list" => onListOfString(AsListOfString()),
            "int" => onInt(AsInt()),
            "set" => onSetOfString(AsSetOfString()),
            _ => throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<string> onString,
        Action<IEnumerable<string>> onListOfString,
        Action<int> onInt,
        Action<HashSet<string>> onSetOfString
    )
    {
        switch (Type)
        {
            case "string":
                onString(AsString());
                break;
            case "list":
                onListOfString(AsListOfString());
                break;
            case "int":
                onInt(AsInt());
                break;
            case "set":
                onSetOfString(AsSetOfString());
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
        if (obj is not UnionWithDuplicateTypes other)
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

    public static implicit operator UnionWithDuplicateTypes(string value) => new("string", value);

    public static implicit operator UnionWithDuplicateTypes(int value) => new("int", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithDuplicateTypes>
    {
        public override UnionWithDuplicateTypes? Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            if (reader.TokenType == JsonTokenType.Number)
            {
                if (reader.TryGetInt32(out var intValue))
                {
                    UnionWithDuplicateTypes intResult = new("int", intValue);
                    return intResult;
                }
            }

            if (reader.TokenType == JsonTokenType.String)
            {
                var stringValue = reader.GetString()!;

                if (int.TryParse(stringValue, out var intFromStringValue))
                {
                    UnionWithDuplicateTypes intFromStringResult = new("int", intFromStringValue);
                    return intFromStringResult;
                }

                UnionWithDuplicateTypes stringResult = new("string", stringValue);
                return stringResult;
            }

            if (reader.TokenType == JsonTokenType.StartArray)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("set", typeof(HashSet<string>)),
                    ("list", typeof(IEnumerable<string>)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            UnionWithDuplicateTypes result = new(key, value);
                            return result;
                        }
                    }
                    catch (JsonException)
                    {
                        // Try next type;
                    }
                }
            }

            throw new JsonException(
                $"Cannot deserialize JSON token {reader.TokenType} into UnionWithDuplicateTypes"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithDuplicateTypes value,
            JsonSerializerOptions options
        )
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            value.Visit(
                str => writer.WriteStringValue(str),
                obj => JsonSerializer.Serialize(writer, obj, options),
                num => writer.WriteNumberValue(num),
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override UnionWithDuplicateTypes? ReadAsPropertyName(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            UnionWithDuplicateTypes result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithDuplicateTypes value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
