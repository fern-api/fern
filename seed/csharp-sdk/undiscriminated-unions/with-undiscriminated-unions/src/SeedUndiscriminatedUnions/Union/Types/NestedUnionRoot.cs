// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

/// <summary>
/// Nested union root.
/// </summary>
[JsonConverter(typeof(NestedUnionRoot.JsonConverter))]
[Serializable]
public class NestedUnionRoot
{
    private NestedUnionRoot(string type, object? value)
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
    public static NestedUnionRoot FromString(string value) => new("string", value);

    /// <summary>
    /// Factory method to create a union from a IEnumerable<string> value.
    /// </summary>
    public static NestedUnionRoot FromListOfString(IEnumerable<string> value) => new("list", value);

    /// <summary>
    /// Factory method to create a union from a SeedUndiscriminatedUnions.NestedUnionL1 value.
    /// </summary>
    public static NestedUnionRoot FromNestedUnionL1(
        SeedUndiscriminatedUnions.NestedUnionL1 value
    ) => new("nestedUnionL1", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString() => Type == "string";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "list"
    /// </summary>
    public bool IsListOfString() => Type == "list";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "nestedUnionL1"
    /// </summary>
    public bool IsNestedUnionL1() => Type == "nestedUnionL1";

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
    /// Returns the value as a <see cref="SeedUndiscriminatedUnions.NestedUnionL1"/> if <see cref="Type"/> is 'nestedUnionL1', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'nestedUnionL1'.</exception>
    public SeedUndiscriminatedUnions.NestedUnionL1 AsNestedUnionL1() =>
        IsNestedUnionL1()
            ? (SeedUndiscriminatedUnions.NestedUnionL1)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'nestedUnionL1'");

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
    /// Attempts to cast the value to a <see cref="SeedUndiscriminatedUnions.NestedUnionL1"/> and returns true if successful.
    /// </summary>
    public bool TryGetNestedUnionL1(out SeedUndiscriminatedUnions.NestedUnionL1? value)
    {
        if (Type == "nestedUnionL1")
        {
            value = (SeedUndiscriminatedUnions.NestedUnionL1)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<string, T> onString,
        Func<IEnumerable<string>, T> onListOfString,
        Func<SeedUndiscriminatedUnions.NestedUnionL1, T> onNestedUnionL1
    )
    {
        return Type switch
        {
            "string" => onString(AsString()),
            "list" => onListOfString(AsListOfString()),
            "nestedUnionL1" => onNestedUnionL1(AsNestedUnionL1()),
            _ => throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<string> onString,
        Action<IEnumerable<string>> onListOfString,
        Action<SeedUndiscriminatedUnions.NestedUnionL1> onNestedUnionL1
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
            case "nestedUnionL1":
                onNestedUnionL1(AsNestedUnionL1());
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
        if (obj is not NestedUnionRoot other)
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

    public static implicit operator NestedUnionRoot(string value) => new("string", value);

    public static implicit operator NestedUnionRoot(
        SeedUndiscriminatedUnions.NestedUnionL1 value
    ) => new("nestedUnionL1", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NestedUnionRoot>
    {
        public override NestedUnionRoot? Read(
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

                NestedUnionRoot stringResult = new("string", stringValue);
                return stringResult;
            }

            if (reader.TokenType == JsonTokenType.StartArray)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("list", typeof(IEnumerable<string>)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            NestedUnionRoot result = new(key, value);
                            return result;
                        }
                    }
                    catch (JsonException)
                    {
                        // Try next type;
                    }
                }
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("nestedUnionL1", typeof(SeedUndiscriminatedUnions.NestedUnionL1)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            NestedUnionRoot result = new(key, value);
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
                $"Cannot deserialize JSON token {reader.TokenType} into NestedUnionRoot"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedUnionRoot value,
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
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override NestedUnionRoot? ReadAsPropertyName(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            NestedUnionRoot result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NestedUnionRoot value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
