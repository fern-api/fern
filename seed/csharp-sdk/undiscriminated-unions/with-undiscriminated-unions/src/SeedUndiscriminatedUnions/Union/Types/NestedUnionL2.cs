// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

/// <summary>
/// Nested layer 2.
/// </summary>
[JsonConverter(typeof(NestedUnionL2.JsonConverter))]
[Serializable]
public class NestedUnionL2
{
    private NestedUnionL2(string type, object? value)
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
    /// Factory method to create a union from a bool value.
    /// </summary>
    public static NestedUnionL2 FromBool(bool value) => new("bool", value);

    /// <summary>
    /// Factory method to create a union from a HashSet<string> value.
    /// </summary>
    public static NestedUnionL2 FromSetOfString(HashSet<string> value) => new("set", value);

    /// <summary>
    /// Factory method to create a union from a IEnumerable<string> value.
    /// </summary>
    public static NestedUnionL2 FromListOfString(IEnumerable<string> value) => new("list", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "bool"
    /// </summary>
    public bool IsBool() => Type == "bool";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "set"
    /// </summary>
    public bool IsSetOfString() => Type == "set";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "list"
    /// </summary>
    public bool IsListOfString() => Type == "list";

    /// <summary>
    /// Returns the value as a <see cref="bool"/> if <see cref="Type"/> is 'bool', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'bool'.</exception>
    public bool AsBool() =>
        IsBool()
            ? (bool)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'bool'");

    /// <summary>
    /// Returns the value as a <see cref="HashSet<string>"/> if <see cref="Type"/> is 'set', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'set'.</exception>
    public HashSet<string> AsSetOfString() =>
        IsSetOfString()
            ? (HashSet<string>)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'set'");

    /// <summary>
    /// Returns the value as a <see cref="IEnumerable<string>"/> if <see cref="Type"/> is 'list', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'list'.</exception>
    public IEnumerable<string> AsListOfString() =>
        IsListOfString()
            ? (IEnumerable<string>)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'list'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="bool"/> and returns true if successful.
    /// </summary>
    public bool TryGetBool(out bool? value)
    {
        if (Type == "bool")
        {
            value = (bool)Value!;
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

    public T Match<T>(
        Func<bool, T> onBool,
        Func<HashSet<string>, T> onSetOfString,
        Func<IEnumerable<string>, T> onListOfString
    )
    {
        return Type switch
        {
            "bool" => onBool(AsBool()),
            "set" => onSetOfString(AsSetOfString()),
            "list" => onListOfString(AsListOfString()),
            _ => throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<bool> onBool,
        Action<HashSet<string>> onSetOfString,
        Action<IEnumerable<string>> onListOfString
    )
    {
        switch (Type)
        {
            case "bool":
                onBool(AsBool());
                break;
            case "set":
                onSetOfString(AsSetOfString());
                break;
            case "list":
                onListOfString(AsListOfString());
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
        if (obj is not NestedUnionL2 other)
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

    public static implicit operator NestedUnionL2(bool value) => new("bool", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NestedUnionL2>
    {
        public override NestedUnionL2? Read(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            if (reader.TokenType == JsonTokenType.Null)
            {
                return null;
            }

            if (reader.TokenType == JsonTokenType.True || reader.TokenType == JsonTokenType.False)
            {
                NestedUnionL2 boolResult = new("bool", reader.GetBoolean());
                return boolResult;
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
                            NestedUnionL2 result = new(key, value);
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
                $"Cannot deserialize JSON token {reader.TokenType} into NestedUnionL2"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedUnionL2 value,
            JsonSerializerOptions options
        )
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            value.Visit(
                b => writer.WriteBooleanValue(b),
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override NestedUnionL2? ReadAsPropertyName(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            NestedUnionL2 result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NestedUnionL2 value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
