// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

/// <summary>
/// Union with multiple named type aliases that all resolve to the same C# type (string).
/// Without the fix, this would generate duplicate implicit operators:
///   public static implicit operator UnionWithTypeAliases(string value) =&gt; ...
///   public static implicit operator UnionWithTypeAliases(string value) =&gt; ...
///   public static implicit operator UnionWithTypeAliases(string value) =&gt; ...
/// causing CS0557 compiler error.
/// </summary>
[JsonConverter(typeof(UnionWithTypeAliases.JsonConverter))]
[Serializable]
public class UnionWithTypeAliases
{
    private UnionWithTypeAliases(string type, object? value)
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
    public static UnionWithTypeAliases FromString(string value) => new("string", value);

    /// <summary>
    /// Factory method to create a union from a string value.
    /// </summary>
    public static UnionWithTypeAliases FromUserId(string value) => new("userId", value);

    /// <summary>
    /// Factory method to create a union from a string value.
    /// </summary>
    public static UnionWithTypeAliases FromName(string value) => new("name", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString() => Type == "string";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "userId"
    /// </summary>
    public bool IsUserId() => Type == "userId";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "name"
    /// </summary>
    public bool IsName() => Type == "name";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public string AsString() =>
        IsString()
            ? (string)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'string'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'userId', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'userId'.</exception>
    public string AsUserId() =>
        IsUserId()
            ? (string)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'userId'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'name', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'name'.</exception>
    public string AsName() =>
        IsName()
            ? (string)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'name'");

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
    /// Attempts to cast the value to a <see cref="string"/> and returns true if successful.
    /// </summary>
    public bool TryGetUserId(out string? value)
    {
        if (Type == "userId")
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
    public bool TryGetName(out string? value)
    {
        if (Type == "name")
        {
            value = (string)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(Func<string, T> onString, Func<string, T> onUserId, Func<string, T> onName)
    {
        return Type switch
        {
            "string" => onString(AsString()),
            "userId" => onUserId(AsUserId()),
            "name" => onName(AsName()),
            _ => throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(Action<string> onString, Action<string> onUserId, Action<string> onName)
    {
        switch (Type)
        {
            case "string":
                onString(AsString());
                break;
            case "userId":
                onUserId(AsUserId());
                break;
            case "name":
                onName(AsName());
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
        if (obj is not UnionWithTypeAliases other)
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

    public static implicit operator UnionWithTypeAliases(string value) => new("string", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithTypeAliases>
    {
        public override UnionWithTypeAliases? Read(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
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

                UnionWithTypeAliases stringResult = new("string", stringValue);
                return stringResult;
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("userId", typeof(string)),
                    ("name", typeof(string)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            UnionWithTypeAliases result = new(key, value);
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
                $"Cannot deserialize JSON token {reader.TokenType} into UnionWithTypeAliases"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            UnionWithTypeAliases value,
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

        public override UnionWithTypeAliases ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            UnionWithTypeAliases result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            UnionWithTypeAliases value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
