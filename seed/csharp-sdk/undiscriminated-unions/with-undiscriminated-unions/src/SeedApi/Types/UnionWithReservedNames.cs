// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedApi.Core;

namespace SeedApi;

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
    /// Factory method to create a union from a SeedApi.UnionWithReservedNamesZero value.
    /// </summary>
    public static UnionWithReservedNames FromUnionWithReservedNamesZero(
        SeedApi.UnionWithReservedNamesZero value
    ) => new("unionWithReservedNamesZero", value);

    /// <summary>
    /// Factory method to create a union from a SeedApi.UnionWithReservedNamesOne value.
    /// </summary>
    public static UnionWithReservedNames FromUnionWithReservedNamesOne(
        SeedApi.UnionWithReservedNamesOne value
    ) => new("unionWithReservedNamesOne", value);

    /// <summary>
    /// Factory method to create a union from a string value.
    /// </summary>
    public static UnionWithReservedNames FromString(string value) => new("string", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "unionWithReservedNamesZero"
    /// </summary>
    public bool IsUnionWithReservedNamesZero() => Type == "unionWithReservedNamesZero";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "unionWithReservedNamesOne"
    /// </summary>
    public bool IsUnionWithReservedNamesOne() => Type == "unionWithReservedNamesOne";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString() => Type == "string";

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithReservedNamesZero"/> if <see cref="Type"/> is 'unionWithReservedNamesZero', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'unionWithReservedNamesZero'.</exception>
    public SeedApi.UnionWithReservedNamesZero AsUnionWithReservedNamesZero() =>
        IsUnionWithReservedNamesZero()
            ? (SeedApi.UnionWithReservedNamesZero)Value!
            : throw new SeedApiException("Union type is not 'unionWithReservedNamesZero'");

    /// <summary>
    /// Returns the value as a <see cref="SeedApi.UnionWithReservedNamesOne"/> if <see cref="Type"/> is 'unionWithReservedNamesOne', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'unionWithReservedNamesOne'.</exception>
    public SeedApi.UnionWithReservedNamesOne AsUnionWithReservedNamesOne() =>
        IsUnionWithReservedNamesOne()
            ? (SeedApi.UnionWithReservedNamesOne)Value!
            : throw new SeedApiException("Union type is not 'unionWithReservedNamesOne'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedApiException">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public string AsString() =>
        IsString() ? (string)Value! : throw new SeedApiException("Union type is not 'string'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithReservedNamesZero"/> and returns true if successful.
    /// </summary>
    public bool TryGetUnionWithReservedNamesZero(out SeedApi.UnionWithReservedNamesZero? value)
    {
        if (Type == "unionWithReservedNamesZero")
        {
            value = (SeedApi.UnionWithReservedNamesZero)Value!;
            return true;
        }
        value = null;
        return false;
    }

    /// <summary>
    /// Attempts to cast the value to a <see cref="SeedApi.UnionWithReservedNamesOne"/> and returns true if successful.
    /// </summary>
    public bool TryGetUnionWithReservedNamesOne(out SeedApi.UnionWithReservedNamesOne? value)
    {
        if (Type == "unionWithReservedNamesOne")
        {
            value = (SeedApi.UnionWithReservedNamesOne)Value!;
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
        Func<SeedApi.UnionWithReservedNamesZero, T> onUnionWithReservedNamesZero,
        Func<SeedApi.UnionWithReservedNamesOne, T> onUnionWithReservedNamesOne,
        Func<string, T> onString
    )
    {
        return Type switch
        {
            "unionWithReservedNamesZero" => onUnionWithReservedNamesZero(
                AsUnionWithReservedNamesZero()
            ),
            "unionWithReservedNamesOne" => onUnionWithReservedNamesOne(
                AsUnionWithReservedNamesOne()
            ),
            "string" => onString(AsString()),
            _ => throw new SeedApiException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<SeedApi.UnionWithReservedNamesZero> onUnionWithReservedNamesZero,
        Action<SeedApi.UnionWithReservedNamesOne> onUnionWithReservedNamesOne,
        Action<string> onString
    )
    {
        switch (Type)
        {
            case "unionWithReservedNamesZero":
                onUnionWithReservedNamesZero(AsUnionWithReservedNamesZero());
                break;
            case "unionWithReservedNamesOne":
                onUnionWithReservedNamesOne(AsUnionWithReservedNamesOne());
                break;
            case "string":
                onString(AsString());
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

    public static implicit operator UnionWithReservedNames(
        SeedApi.UnionWithReservedNamesZero value
    ) => new("unionWithReservedNamesZero", value);

    public static implicit operator UnionWithReservedNames(
        SeedApi.UnionWithReservedNamesOne value
    ) => new("unionWithReservedNamesOne", value);

    public static implicit operator UnionWithReservedNames(string value) => new("string", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<UnionWithReservedNames>
    {
        public override UnionWithReservedNames? Read(
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

                UnionWithReservedNames stringResult = new("string", stringValue);
                return stringResult;
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("unionWithReservedNamesZero", typeof(SeedApi.UnionWithReservedNamesZero)),
                    ("unionWithReservedNamesOne", typeof(SeedApi.UnionWithReservedNamesOne)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            UnionWithReservedNames result = new(key, value);
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

        public override UnionWithReservedNames ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
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
