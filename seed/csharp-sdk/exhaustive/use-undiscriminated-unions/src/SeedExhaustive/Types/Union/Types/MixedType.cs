// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using System.Text.Json;
using System.Text.Json.Serialization;
using SeedExhaustive;
using SeedExhaustive.Core;

namespace SeedExhaustive.Types;

[JsonConverter(typeof(MixedType.JsonConverter))]
[Serializable]
public class MixedType
{
    private MixedType(string type, object? value)
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
    /// Factory method to create a union from a double value.
    /// </summary>
    public static MixedType FromDouble(double value) => new("double", value);

    /// <summary>
    /// Factory method to create a union from a bool value.
    /// </summary>
    public static MixedType FromBool(bool value) => new("bool", value);

    /// <summary>
    /// Factory method to create a union from a string value.
    /// </summary>
    public static MixedType FromString(string value) => new("string", value);

    /// <summary>
    /// Factory method to create a union from a IEnumerable<string> value.
    /// </summary>
    public static MixedType FromListOfString(IEnumerable<string> value) => new("list", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "double"
    /// </summary>
    public bool IsDouble() => Type == "double";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "bool"
    /// </summary>
    public bool IsBool() => Type == "bool";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString() => Type == "string";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "list"
    /// </summary>
    public bool IsListOfString() => Type == "list";

    /// <summary>
    /// Returns the value as a <see cref="double"/> if <see cref="Type"/> is 'double', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedExhaustiveException">Thrown when <see cref="Type"/> is not 'double'.</exception>
    public double AsDouble() =>
        IsDouble()
            ? (double)Value!
            : throw new SeedExhaustiveException("Union type is not 'double'");

    /// <summary>
    /// Returns the value as a <see cref="bool"/> if <see cref="Type"/> is 'bool', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedExhaustiveException">Thrown when <see cref="Type"/> is not 'bool'.</exception>
    public bool AsBool() =>
        IsBool() ? (bool)Value! : throw new SeedExhaustiveException("Union type is not 'bool'");

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedExhaustiveException">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public string AsString() =>
        IsString()
            ? (string)Value!
            : throw new SeedExhaustiveException("Union type is not 'string'");

    /// <summary>
    /// Returns the value as a <see cref="IEnumerable<string>"/> if <see cref="Type"/> is 'list', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedExhaustiveException">Thrown when <see cref="Type"/> is not 'list'.</exception>
    public IEnumerable<string> AsListOfString() =>
        IsListOfString()
            ? (IEnumerable<string>)Value!
            : throw new SeedExhaustiveException("Union type is not 'list'");

    /// <summary>
    /// Attempts to cast the value to a <see cref="double"/> and returns true if successful.
    /// </summary>
    public bool TryGetDouble(out double? value)
    {
        if (Type == "double")
        {
            value = (double)Value!;
            return true;
        }
        value = null;
        return false;
    }

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

    public T Match<T>(
        Func<double, T> onDouble,
        Func<bool, T> onBool,
        Func<string, T> onString,
        Func<IEnumerable<string>, T> onListOfString
    )
    {
        return Type switch
        {
            "double" => onDouble(AsDouble()),
            "bool" => onBool(AsBool()),
            "string" => onString(AsString()),
            "list" => onListOfString(AsListOfString()),
            _ => throw new SeedExhaustiveException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<double> onDouble,
        Action<bool> onBool,
        Action<string> onString,
        Action<IEnumerable<string>> onListOfString
    )
    {
        switch (Type)
        {
            case "double":
                onDouble(AsDouble());
                break;
            case "bool":
                onBool(AsBool());
                break;
            case "string":
                onString(AsString());
                break;
            case "list":
                onListOfString(AsListOfString());
                break;
            default:
                throw new SeedExhaustiveException($"Unknown union type: {Type}");
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
        if (obj is not MixedType other)
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

    public static implicit operator MixedType(double value) => new("double", value);

    public static implicit operator MixedType(bool value) => new("bool", value);

    public static implicit operator MixedType(string value) => new("string", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<MixedType>
    {
        public override MixedType? Read(
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
                MixedType doubleResult = new("double", reader.GetDouble());
                return doubleResult;
            }

            if (reader.TokenType == JsonTokenType.True || reader.TokenType == JsonTokenType.False)
            {
                MixedType boolResult = new("bool", reader.GetBoolean());
                return boolResult;
            }

            if (reader.TokenType == JsonTokenType.String)
            {
                var stringValue = reader.GetString()!;

                MixedType stringResult = new("string", stringValue);
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
                            MixedType result = new(key, value);
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
                $"Cannot deserialize JSON token {reader.TokenType} into MixedType"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            MixedType value,
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
                b => writer.WriteBooleanValue(b),
                str => writer.WriteStringValue(str),
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override MixedType ReadAsPropertyName(
            ref Utf8JsonReader reader,
            System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            MixedType result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            MixedType value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
