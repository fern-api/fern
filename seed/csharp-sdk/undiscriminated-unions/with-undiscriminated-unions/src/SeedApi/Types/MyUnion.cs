// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

/// <summary>
/// Several different types are accepted.
/// </summary>
[JsonConverter(typeof(MyUnion.JsonConverter))]
[Serializable]
public class MyUnion
{
    private MyUnion(string type, object? value)
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
    public static MyUnion FromString(string value) => new("string", value);

    /// <summary>
    /// Factory method to create a union from a int value.
    /// </summary>
    public static MyUnion FromInt(int value) => new("int", value);

    /// <summary>
    /// Factory method to create a union from a IEnumerable<int> value.
    /// </summary>
    public static MyUnion FromListOfInt(IEnumerable<int> value) => new("list", value);

    /// <summary>
    /// Factory method to create a union from a IEnumerable<IEnumerable<int>> value.
    /// </summary>
    public static MyUnion FromListOfListOfInt(IEnumerable<IEnumerable<int>> value) =>
        new("list_1", value);

    /// <summary>
    /// Factory method to create a union from a IEnumerable<string> value.
    /// </summary>
    public static MyUnion FromListOfString(IEnumerable<string> value) => new("list_2", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString() => Type == "string";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "int"
    /// </summary>
    public bool IsInt() => Type == "int";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "list"
    /// </summary>
    public bool IsListOfInt() => Type == "list";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "list_1"
    /// </summary>
    public bool IsListOfListOfInt() => Type == "list_1";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "list_2"
    /// </summary>
    public bool IsListOfString() => Type == "list_2";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public string AsString() =>
        IsString() ? (string)Value! : throw new SeedApiException("Union type is not 'string'");

    /// <summary>
    /// Returns the value as a <see cref="int"/> if <see cref="Type"/> is 'int', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'int'.</exception>
    public int AsInt() =>
        IsInt() ? (int)Value! : throw new SeedApiException("Union type is not 'int'");

    /// <summary>
    /// Returns the value as a <see cref="IEnumerable<int>"/> if <see cref="Type"/> is 'list', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'list'.</exception>
    public IEnumerable<int> AsListOfInt() =>
        IsListOfInt()
            ? (IEnumerable<int>)Value!
            : throw new SeedApiException("Union type is not 'list'");

    /// <summary>
    /// Returns the value as a <see cref="IEnumerable<IEnumerable<int>>"/> if <see cref="Type"/> is 'list_1', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'list_1'.</exception>
    public IEnumerable<IEnumerable<int>> AsListOfListOfInt() =>
        IsListOfListOfInt()
            ? (IEnumerable<IEnumerable<int>>)Value!
            : throw new SeedApiException("Union type is not 'list_1'");

    /// <summary>
    /// Returns the value as a <see cref="IEnumerable<string>"/> if <see cref="Type"/> is 'list_2', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'list_2'.</exception>
    public IEnumerable<string> AsListOfString() =>
        IsListOfString()
            ? (IEnumerable<string>)Value!
            : throw new SeedApiException("Union type is not 'list_2'");

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
    /// Attempts to cast the value to a <see cref="IEnumerable<int>"/> and returns true if successful.
    /// </summary>
    public bool TryGetListOfInt(out IEnumerable<int>? value)
    {
        if (Type == "list")
        {
            value = (IEnumerable<int>)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="IEnumerable<IEnumerable<int>>"/> and returns true if successful.
    /// </summary>
    public bool TryGetListOfListOfInt(out IEnumerable<IEnumerable<int>>? value)
    {
        if (Type == "list_1")
        {
            value = (IEnumerable<IEnumerable<int>>)Value!;
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
        if (Type == "list_2")
        {
            value = (IEnumerable<string>)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<string, T> onString,
        Func<int, T> onInt,
        Func<IEnumerable<int>, T> onListOfInt,
        Func<IEnumerable<IEnumerable<int>>, T> onListOfListOfInt,
        Func<IEnumerable<string>, T> onListOfString
    )
    {
        return Type switch
        {
            "string" => onString(AsString()),
            "int" => onInt(AsInt()),
            "list" => onListOfInt(AsListOfInt()),
            "list_1" => onListOfListOfInt(AsListOfListOfInt()),
            "list_2" => onListOfString(AsListOfString()),
            _ => throw new SeedApiException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<string> onString,
        Action<int> onInt,
        Action<IEnumerable<int>> onListOfInt,
        Action<IEnumerable<IEnumerable<int>>> onListOfListOfInt,
        Action<IEnumerable<string>> onListOfString
    )
    {
        switch (Type)
        {
            case "string":
                onString(AsString());
                break;
            case "int":
                onInt(AsInt());
                break;
            case "list":
                onListOfInt(AsListOfInt());
                break;
            case "list_1":
                onListOfListOfInt(AsListOfListOfInt());
                break;
            case "list_2":
                onListOfString(AsListOfString());
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
        if (obj is not MyUnion other)
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

    public static implicit operator MyUnion(string value) => new("string", value);

    public static implicit operator MyUnion(int value) => new("int", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<MyUnion>
    {
        public override MyUnion? Read(
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
                    MyUnion intResult = new("int", intValue);
                    return intResult;
                }
            }

            if (reader.TokenType == JsonTokenType.String)
            {
                var stringValue = reader.GetString()!;

                if (int.TryParse(stringValue, out var intFromStringValue))
                {
                    MyUnion intFromStringResult = new("int", intFromStringValue);
                    return intFromStringResult;
                }

                MyUnion stringResult = new("string", stringValue);
                return stringResult;
            }

            if (reader.TokenType == JsonTokenType.StartArray)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("list_1", typeof(IEnumerable<IEnumerable<int>>)),
                    ("list", typeof(IEnumerable<int>)),
                    ("list_2", typeof(IEnumerable<string>)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            MyUnion result = new(key, value);
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
                $"Cannot deserialize JSON token {reader.TokenType} into MyUnion"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            MyUnion value,
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
                num => writer.WriteNumberValue(num),
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options),
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override MyUnion ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            MyUnion result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            MyUnion value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
