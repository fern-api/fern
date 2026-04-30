// ReSharper disable NullableWarningSuppressionIsUsed
// ReSharper disable InconsistentNaming

using global::System.Text.Json;
using global::System.Text.Json.Serialization;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions;

/// <summary>
/// Outer union where one variant is an object containing a nested union field.
/// Tests that the deserializer correctly handles transitive union deserialization.
/// </summary>
[JsonConverter(typeof(OuterNestedUnion.JsonConverter))]
[Serializable]
public class OuterNestedUnion
{
    private OuterNestedUnion(string type, object? value)
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
    public static OuterNestedUnion FromString(string value) => new("string", value);

    /// <summary>
    /// Factory method to create a union from a SeedUndiscriminatedUnions.WrapperObject value.
    /// </summary>
    public static OuterNestedUnion FromWrapperObject(
        SeedUndiscriminatedUnions.WrapperObject value
    ) => new("wrapperObject", value);

    /// <summary>
    /// Returns true if <see cref="Type"/> is "string"
    /// </summary>
    public bool IsString() => Type == "string";

    /// <summary>
    /// Returns true if <see cref="Type"/> is "wrapperObject"
    /// </summary>
    public bool IsWrapperObject() => Type == "wrapperObject";

    /// <summary>
    /// Returns the value as a <see cref="string"/> if <see cref="Type"/> is 'string', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'string'.</exception>
    public string AsString() =>
        IsString()
            ? (string)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'string'");

    /// <summary>
    /// Returns the value as a <see cref="SeedUndiscriminatedUnions.WrapperObject"/> if <see cref="Type"/> is 'wrapperObject', otherwise throws an exception.
    /// </summary>
    /// <exception cref="SeedUndiscriminatedUnionsException">Thrown when <see cref="Type"/> is not 'wrapperObject'.</exception>
    public SeedUndiscriminatedUnions.WrapperObject AsWrapperObject() =>
        IsWrapperObject()
            ? (SeedUndiscriminatedUnions.WrapperObject)Value!
            : throw new SeedUndiscriminatedUnionsException("Union type is not 'wrapperObject'");

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
    /// Attempts to cast the value to a <see cref="SeedUndiscriminatedUnions.WrapperObject"/> and returns true if successful.
    /// </summary>
    public bool TryGetWrapperObject(out SeedUndiscriminatedUnions.WrapperObject? value)
    {
        if (Type == "wrapperObject")
        {
            value = (SeedUndiscriminatedUnions.WrapperObject)Value!;
            return true;
        }
        value = null;
        return false;
    }

    public T Match<T>(
        Func<string, T> onString,
        Func<SeedUndiscriminatedUnions.WrapperObject, T> onWrapperObject
    )
    {
        return Type switch
        {
            "string" => onString(AsString()),
            "wrapperObject" => onWrapperObject(AsWrapperObject()),
            _ => throw new SeedUndiscriminatedUnionsException($"Unknown union type: {Type}"),
        };
    }

    public void Visit(
        Action<string> onString,
        Action<SeedUndiscriminatedUnions.WrapperObject> onWrapperObject
    )
    {
        switch (Type)
        {
            case "string":
                onString(AsString());
                break;
            case "wrapperObject":
                onWrapperObject(AsWrapperObject());
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
        if (obj is not OuterNestedUnion other)
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

    public static implicit operator OuterNestedUnion(string value) => new("string", value);

    public static implicit operator OuterNestedUnion(
        SeedUndiscriminatedUnions.WrapperObject value
    ) => new("wrapperObject", value);

    [Serializable]
    internal sealed class JsonConverter : JsonConverter<OuterNestedUnion>
    {
        public override OuterNestedUnion? Read(
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

                OuterNestedUnion stringResult = new("string", stringValue);
                return stringResult;
            }

            if (reader.TokenType == JsonTokenType.StartObject)
            {
                var document = JsonDocument.ParseValue(ref reader);

                var types = new (string Key, System.Type Type)[]
                {
                    ("wrapperObject", typeof(SeedUndiscriminatedUnions.WrapperObject)),
                };

                foreach (var (key, type) in types)
                {
                    try
                    {
                        var value = document.Deserialize(type, options);
                        if (value != null)
                        {
                            OuterNestedUnion result = new(key, value);
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
                $"Cannot deserialize JSON token {reader.TokenType} into OuterNestedUnion"
            );
        }

        public override void Write(
            Utf8JsonWriter writer,
            OuterNestedUnion value,
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
                obj => JsonSerializer.Serialize(writer, obj, options)
            );
        }

        public override OuterNestedUnion ReadAsPropertyName(
            ref Utf8JsonReader reader,
            global::System.Type typeToConvert,
            JsonSerializerOptions options
        )
        {
            var stringValue = reader.GetString()!;
            OuterNestedUnion result = new("string", stringValue);
            return result;
        }

        public override void WriteAsPropertyName(
            Utf8JsonWriter writer,
            OuterNestedUnion value,
            JsonSerializerOptions options
        )
        {
            writer.WritePropertyName(value.Value?.ToString() ?? "null");
        }
    }
}
