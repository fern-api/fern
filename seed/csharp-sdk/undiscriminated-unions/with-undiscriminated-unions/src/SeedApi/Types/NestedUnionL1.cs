// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// Nested layer 1.
/// </summary>
[JsonConverter(typeof(NestedUnionL1.JsonConverter))]
[Serializable]
public class NestedUnionL1
{
    private NestedUnionL1(string type, object? value)
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
    /// Factory method to create a union from a int value.
    /// </summary>
    public static NestedUnionL1 FromInt(int value) => new("int", value);

    /// <summary>
    /// Factory method to create a union from a IEnumerable<string> value.
    /// </summary>
    public static NestedUnionL1 FromListOfString(IEnumerable<string> value) => new("list", value);

    /// <summary>
    /// Factory method to create a union from a SeedApi.NestedUnionL2 value.
    /// </summary>
    public static NestedUnionL1 FromNestedUnionL2(SeedApi.NestedUnionL2 value) =>
        new("nestedUnionL2", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "int"
    /// </summary>
    public bool IsInt() => Type == "int";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "list"
    /// </summary>
    public bool IsListOfString() => Type == "list";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "nestedUnionL2"
    /// </summary>
    public bool IsNestedUnionL2() => Type == "nestedUnionL2";

    /// <summary>
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'int', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'int'.</exception>
    public int AsInt() =>
        IsInt() ? (int)Value! : throw new SeedApiException("Union type is not 'int'");

    /// <summary>
    /// Returns the value as a <see cref="IEnumerable<string>"/> if <see cref="Type"/> is 'list', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'list'.</exception>
    public IEnumerable<string> AsListOfString() =>
        IsListOfString()
            ? (IEnumerable<string>)Value!
            : throw new SeedApiException("Union type is not 'list'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.NestedUnionL2"/> if <see cref="Type"/> is 'nestedUnionL2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'nestedUnionL2'.</exception>
    public SeedApi.NestedUnionL2 AsNestedUnionL2() =>
        IsNestedUnionL2()
            ? (SeedApi.NestedUnionL2)Value!
            : throw new SeedApiException("Union type is not 'nestedUnionL2'");

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
    /// Attempts to cast the value to a <see cref="SeedApi.NestedUnionL2"/> and returns true if successful.
    /// </summary>
    public bool TryGetNestedUnionL2(out SeedApi.NestedUnionL2? value)
    {
        if (Type == "nestedUnionL2")
        {
            value = (SeedApi.NestedUnionL2)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<int, T> onInt,
        Func<IEnumerable<string>, T> onListOfString,
        Func<SeedApi.NestedUnionL2, T> onNestedUnionL2
    )
    {
        return Type switch
        {
            "int" => onInt(AsInt()),
            "list" => onListOfString(AsListOfString()),
            "nestedUnionL2" => onNestedUnionL2(AsNestedUnionL2()),
            _ => throw new SeedApiException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<int> onInt,
        Action<IEnumerable<string>> onListOfString,
        Action<SeedApi.NestedUnionL2> onNestedUnionL2
    )
    {
        switch (Type)
        {
            case "int":
                onInt(AsInt());
                break;
            case "list":
                onListOfString(AsListOfString());
                break;
            case "nestedUnionL2":
                onNestedUnionL2(AsNestedUnionL2());
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
        if (obj is not NestedUnionL1 other)
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

    public static implicit operator NestedUnionL1(int value) => new("int", value);

    public static implicit operator NestedUnionL1(SeedApi.NestedUnionL2 value) =>
        new("nestedUnionL2", value);

    public static implicit operator NestedUnionL1(bool value) =>
        new("nestedUnionL2", (NestedUnionL2)value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<NestedUnionL1>
    {
        public override NestedUnionL1? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
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
                    NestedUnionL1 intResult = new("int", intValue);
                    return intResult;
                }
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
                            NestedUnionL1 result = new(key, value);
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
                    ("nestedUnionL2", typeof(SeedApi.NestedUnionL2)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            NestedUnionL1 result = new(key, value);
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
                $"Cannot deserialize JSON token {reader.TokenType} into NestedUnionL1"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            NestedUnionL1 value,
            JsonSerializerOptions options
        )
        {
            if (value == null)
            {
                writer.WriteNullValue();
                return;
            }

            value.Visit(
                num => writer.WriteNumberValue(num),
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override NestedUnionL1 ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            NestedUnionL1 result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            NestedUnionL1 value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
